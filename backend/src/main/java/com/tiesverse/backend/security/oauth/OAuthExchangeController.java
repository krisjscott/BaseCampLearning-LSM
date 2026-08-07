package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/oauth")
@RequiredArgsConstructor
public class OAuthExchangeController {

    private final OAuthExchangeService exchangeService;

    @PostMapping("/exchange")
    public ResponseEntity<ApiResponse<OAuthExchangeResponse>> exchange(@Valid @RequestBody ExchangeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(exchangeService.exchange(request.getCode())));
    }

    @Data
    public static class ExchangeRequest {
        @NotBlank
        private String code;
    }
}
