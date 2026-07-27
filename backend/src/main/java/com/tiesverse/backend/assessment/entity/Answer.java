package com.tiesverse.backend.assessment.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer extends BaseEntity {

    @Column(name = "result_id", nullable = false)
    private UUID resultId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "answer_text")
    private String answerText;

    @Column(name = "selected_option_id")
    private UUID selectedOptionId;

    private boolean correct;

    private Integer points;
}
