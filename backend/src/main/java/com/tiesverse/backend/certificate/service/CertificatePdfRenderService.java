package com.tiesverse.backend.certificate.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.tiesverse.backend.certificate.entity.CertificateTemplate;
import com.tiesverse.backend.certificate.entity.CertificateTemplateElement;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.storage.FileStorageService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;

/**
 * Renders a certificate PDF by overlaying template elements (text/QR) onto the admin-uploaded
 * template, entirely in memory. Nothing produced here is ever written to disk — the caller streams
 * the returned bytes straight back in the HTTP response.
 */
@Service
public class CertificatePdfRenderService {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("\\{\\{\\s*([a-z_]+)\\s*}}");
    private static final PDFont HELVETICA = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDFont HELVETICA_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final int QR_IMAGE_PIXELS = 400;

    private final FileStorageService fileStorageService;

    public CertificatePdfRenderService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public byte[] render(CertificateTemplate template, List<CertificateTemplateElement> elements,
                          Map<String, String> tokenValues, String verifyUrl) {
        byte[] originalPdf;
        try {
            originalPdf = Files.readAllBytes(fileStorageService.resolve(template.getOriginalPdfUrl()));
        } catch (IOException e) {
            throw new BadRequestException("Could not read the certificate template file: " + e.getMessage());
        }

        try (PDDocument document = Loader.loadPDF(originalPdf);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = document.getPage(0);
            double pageHeight = page.getMediaBox().getHeight();

            byte[] qrPng = elements.stream().anyMatch(e -> e.getElementType().name().equals("QR"))
                    ? generateQrPng(verifyUrl)
                    : null;

            try (PDPageContentStream contentStream = new PDPageContentStream(
                    document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                for (CertificateTemplateElement element : elements) {
                    switch (element.getElementType()) {
                        case TEXT -> drawText(contentStream, element, tokenValues, pageHeight);
                        case QR -> drawQr(document, contentStream, element, qrPng, pageHeight);
                    }
                }
            }

            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BadRequestException("Could not render the certificate: " + e.getMessage());
        }
    }

    public static String resolveTokens(String content, Map<String, String> tokenValues) {
        if (content == null) return "";
        Matcher matcher = TOKEN_PATTERN.matcher(content);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String value = tokenValues.getOrDefault(matcher.group(1), "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private void drawText(PDPageContentStream contentStream, CertificateTemplateElement element,
                           Map<String, String> tokenValues, double pageHeight) throws IOException {
        String text = resolveTokens(element.getContent(), tokenValues);
        if (text.isBlank()) return;

        PDFont font = Boolean.TRUE.equals(element.getBold()) ? HELVETICA_BOLD : HELVETICA;
        float fontSize = element.getFontSize() != null ? element.getFontSize().floatValue() : 16f;
        float textWidth = font.getStringWidth(text) / 1000f * fontSize;

        float startX = element.getX().floatValue();
        String align = element.getTextAlign() != null ? element.getTextAlign().name() : "LEFT";
        if ("CENTER".equals(align)) {
            startX = (float) (element.getX() + (element.getWidth() - textWidth) / 2);
        } else if ("RIGHT".equals(align)) {
            startX = (float) (element.getX() + element.getWidth() - textWidth);
        }

        float baselineY = (float) (pageHeight - element.getY() - element.getHeight() / 2 - fontSize * 0.35);

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        if (element.getFontColor() != null) {
            float[] rgb = parseHexColor(element.getFontColor());
            contentStream.setNonStrokingColor(rgb[0], rgb[1], rgb[2]);
        }
        contentStream.newLineAtOffset(startX, baselineY);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void drawQr(PDDocument document, PDPageContentStream contentStream, CertificateTemplateElement element,
                         byte[] qrPng, double pageHeight) throws IOException {
        if (qrPng == null) return;
        PDImageXObject image = PDImageXObject.createFromByteArray(document, qrPng, "qr");
        float x = element.getX().floatValue();
        float y = (float) (pageHeight - element.getY() - element.getHeight());
        contentStream.drawImage(image, x, y, element.getWidth().floatValue(), element.getHeight().floatValue());
    }

    private byte[] generateQrPng(String verifyUrl) throws IOException {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(verifyUrl, BarcodeFormat.QR_CODE, QR_IMAGE_PIXELS, QR_IMAGE_PIXELS);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            ImageIO.write(image, "png", buffer);
            return buffer.toByteArray();
        } catch (WriterException e) {
            throw new IOException("Could not generate QR code: " + e.getMessage(), e);
        }
    }

    private float[] parseHexColor(String hex) {
        try {
            String cleaned = hex.startsWith("#") ? hex.substring(1) : hex;
            int r = Integer.parseInt(cleaned.substring(0, 2), 16);
            int g = Integer.parseInt(cleaned.substring(2, 4), 16);
            int b = Integer.parseInt(cleaned.substring(4, 6), 16);
            return new float[]{r / 255f, g / 255f, b / 255f};
        } catch (Exception e) {
            return new float[]{0f, 0f, 0f};
        }
    }
}
