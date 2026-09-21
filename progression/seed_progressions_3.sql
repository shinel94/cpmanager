-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 시드 데이터 (배치 3: ID 65~96)
-- 대상 테이블: system_recommendation_progressions, system_progression_steps
-- ==============================================================================

-- 65. I - V - IV - IV (심플 팝/록 4도 오픈형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (65, 'I - V - IV - IV (심플 팝/록 4도 오픈형)', '["Chorus", "Verse"]', '후반 2마디를 IV도로 시원하게 열어주며 멜로디의 공간감을 극대화하는 브릿팝/인디 록 단골 후렴', 89, 90, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(65, 1, 'I', 'major', NULL, NULL),
(65, 2, 'V', 'major', NULL, NULL),
(65, 3, 'IV', 'major', NULL, NULL),
(65, 4, 'IV', 'major', NULL, NULL);

-- 66. IV - V - vi - IV (왕도 4도 루프 팝 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (66, 'IV - V - vi - IV (왕도 4도 루프 팝 후렴)', '["Chorus"]', '왕도 진행의 끝을 IV도로 연결하여 쉼 없이 청량하고 경쾌하게 달리는 K-Pop 댄스/틴팝 후렴 진행', 93, 92, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(66, 1, 'IV', 'major', NULL, NULL),
(66, 2, 'V', 'major', NULL, NULL),
(66, 3, 'vi', 'minor', NULL, NULL),
(66, 4, 'IV', 'major', NULL, NULL);

-- 67. vi - IV - V - I (마이너 출발 으뜸 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (67, 'vi - IV - V - I (마이너 출발 으뜸 종지)', '["Verse", "Bridge"]', '마이너의 애수 어린 분위기로 시작해 4-5-1의 통쾌하고 따뜻한 장조 종지로 해소되는 균형 잡힌 진행', 88, 94, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(67, 1, 'vi', 'minor', NULL, NULL),
(67, 2, 'IV', 'major', NULL, NULL),
(67, 3, 'V', 'major', NULL, NULL),
(67, 4, 'I', 'major', NULL, NULL);

-- 68. I - iii - IV - V (상행 다이어토닉 팝 발라드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (68, 'I - iii - IV - V (상행 다이어토닉 팝 발라드)', '["Verse", "Intro"]', '1도부터 5도까지 자연스럽게 감정이 고조되며 멜로디의 서정적인 흐름을 유도하는 발라드/어쿠스틱 진행', 90, 93, 'stepwise_ascent', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(68, 1, 'I', 'major', NULL, NULL),
(68, 2, 'iii', 'minor', NULL, NULL),
(68, 3, 'IV', 'major', NULL, NULL),
(68, 4, 'V', 'major', NULL, NULL);

-- 69. ii - V - vi - IV (2-5 대리마이너 후 4도 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (69, 'ii - V - vi - IV (2-5 대리마이너 후 4도 턴)', '["Pre-Chorus", "Chorus"]', '2-5 진행 후 1도 대신 대리코드 vi로 우회하여 여운을 남긴 뒤 IV도로 전환하는 감각적인 팝 진행', 87, 91, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(69, 1, 'ii', 'minor', NULL, NULL),
(69, 2, 'V', 'major', NULL, NULL),
(69, 3, 'vi', 'minor', NULL, NULL),
(69, 4, 'IV', 'major', NULL, NULL);

-- 70. I - bVII - bVI - V (안달루시아 록 브릿지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (70, 'I - bVII - bVI - V (안달루시아 록 브릿지)', '["Bridge", "Intro"]', '으뜸음에서 출발해 베이스가 단계적으로 하강(플라멩코/하드록 모달)하여 비장미를 극대화하는 브릿지 진행', 85, 89, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(70, 1, 'I', 'major', NULL, NULL),
(70, 2, 'bVII', 'major', NULL, NULL),
(70, 3, 'bVI', 'major', NULL, NULL),
(70, 4, 'V', 'major', NULL, NULL);

-- 71. IV - I - ii - V (부드러운 프리코러스 빌드업)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (71, 'IV - I - ii - V (부드러운 프리코러스 빌드업)', '["Pre-Chorus"]', '서브도미넌트에서 1도로 안정감을 준 후 2-5로 다시 에너지를 축적하여 코러스 진입을 예비하는 빌드업', 89, 93, 'subdominant_start', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(71, 1, 'IV', 'major', NULL, NULL),
(71, 2, 'I', 'major', NULL, NULL),
(71, 3, 'ii', 'minor', NULL, NULL),
(71, 4, 'V', 'major', NULL, NULL);

-- 72. vi - V - IV - I (마이너 플라갈 하강 안착)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (72, 'vi - V - IV - I (마이너 플라갈 하강 안착)', '["Verse", "Bridge"]', '마이너에서 베이스가 하강하다가 4도에서 1도로 이어지는 변격 종지(Plagal)로 포근하게 마무리되는 진행', 86, 90, 'descending_line', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(72, 1, 'vi', 'minor', NULL, NULL),
(72, 2, 'V', 'major', NULL, NULL),
(72, 3, 'IV', 'major', NULL, NULL),
(72, 4, 'I', 'major', NULL, NULL);

-- 73. I - V/7 - vi - iii (캐논 베이스 하강 완성형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (73, 'I - V/7 - vi - iii (캐논 베이스 하강 완성형)', '["Verse", "Intro"]', 'V코드에 7음 베이스를 적용하여 파헬벨 캐논의 원래 베이스 선율을 완벽히 재현한 최고급 서정 진행', 91, 95, 'descending_bass', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(73, 1, 'I', 'major', NULL, NULL),
(73, 2, 'V', 'major', NULL, '7'),
(73, 3, 'vi', 'minor', NULL, NULL),
(73, 4, 'iii', 'minor', NULL, NULL);

-- 74. IV - V - I - V (후렴 도미넌트 회전형 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (74, 'IV - V - I - V (후렴 도미넌트 회전형 루프)', '["Chorus"]', '3번째 마디 으뜸음 해소 후 4번째 마디에서 다시 V도로 던져주어 후렴 멜로디의 2회차 반복을 강력히 유도', 90, 93, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(74, 1, 'IV', 'major', NULL, NULL),
(74, 2, 'V', 'major', NULL, NULL),
(74, 3, 'I', 'major', NULL, NULL),
(74, 4, 'V', 'major', NULL, NULL);

-- 75. ii - iii - vi - V (부드러운 재즈 팝 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (75, 'ii - iii - vi - V (부드러운 재즈 팝 프리코러스)', '["Pre-Chorus"]', '2-3도 상행 후 vi로 안착했다가 5도로 전환되는 감미로운 시티팝/어반 프리코러스 진행', 85, 91, 'stepwise_ascent', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(75, 1, 'ii', 'minor', NULL, NULL),
(75, 2, 'iii', 'minor', NULL, NULL),
(75, 3, 'vi', 'minor', NULL, NULL),
(75, 4, 'V', 'major', NULL, NULL);

-- 76. bVI - V - I - I (모달 차용 도미넌트 직접 해결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (76, 'bVI - V - I - I (모달 차용 도미넌트 직접 해결)', '["Outro", "Bridge"]', 'bVI에서 V도로 강렬하게 반음 하강하여 도미넌트 긴장을 조성한 뒤 1도로 완전 종지하는 인상적인 아웃트로', 84, 89, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(76, 1, 'bVI', 'major', NULL, NULL),
(76, 2, 'V', 'major', NULL, NULL),
(76, 3, 'I', 'major', NULL, NULL),
(76, 4, 'I', 'major', NULL, NULL);

-- 77. I - IV - V - IV (클래식 록/팝 뱀프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (77, 'I - IV - V - IV (클래식 록/팝 뱀프)', '["Verse", "Intro"]', '60-70년대 비틀즈, 롤링스톤스부터 현대 펑크 록까지 쓰이는 단순하면서도 중독성 강한 에너지 뱀프', 86, 88, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(77, 1, 'I', 'major', NULL, NULL),
(77, 2, 'IV', 'major', NULL, NULL),
(77, 3, 'V', 'major', NULL, NULL),
(77, 4, 'IV', 'major', NULL, NULL);

-- 78. vi - ii - V - vi (단조 감성 마이너 2-5 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (78, 'vi - ii - V - vi (단조 감성 마이너 2-5 루프)', '["Verse", "Interlude"]', 'vi도를 으뜸음처럼 활용하는 평행단조 중심의 2-5-1 루프로 서늘하고 몽환적인 R&B/힙합 트랙에 적합', 87, 93, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(78, 1, 'vi', 'minor', NULL, NULL),
(78, 2, 'ii', 'minor', NULL, NULL),
(78, 3, 'V', 'major', NULL, NULL),
(78, 4, 'vi', 'minor', NULL, NULL);

-- 79. IV - I - IV - V (서브도미넌트 대비 후 도미넌트 빌드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (79, 'IV - I - IV - V (서브도미넌트 대비 후 도미넌트 빌드)', '["Pre-Chorus", "Verse"]', '4도와 1도의 온화한 교차 후 마지막 5도에서 힘차게 후렴을 열어주는 희망찬 프리코러스 진행', 88, 92, 'subdominant_start', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(79, 1, 'IV', 'major', NULL, NULL),
(79, 2, 'I', 'major', NULL, NULL),
(79, 3, 'IV', 'major', NULL, NULL),
(79, 4, 'V', 'major', NULL, NULL);

-- 80. I - bVII - IV - V (믹솔리디안 드라이브 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (80, 'I - bVII - IV - V (믹솔리디안 드라이브 프리코러스)', '["Pre-Chorus", "Chorus"]', 'bVII의 거친 록 사운드와 IV-V의 추진력이 결합되어 폭발적인 코러스 진입을 만들어내는 진행', 85, 89, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(80, 1, 'I', 'major', NULL, NULL),
(80, 2, 'bVII', 'major', NULL, NULL),
(80, 3, 'IV', 'major', NULL, NULL),
(80, 4, 'V', 'major', NULL, NULL);

-- 81. ii - V - I - III7 (2-5-1 후 vi 향한 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (81, 'ii - V - I - III7 (2-5-1 후 vi 향한 세컨더리 도미넌트)', '["Verse", "Interlude"]', '깔끔하게 1도로 해결된 후 곧바로 vi로 연결되는 세컨더리 도미넌트 III7을 투입하여 다음 프레이즈를 예고', 86, 94, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(81, 1, 'ii', 'minor', NULL, NULL),
(81, 2, 'V', 'major', NULL, NULL),
(81, 3, 'I', 'major', NULL, NULL),
(81, 4, 'III', 'dominant', '7', NULL);

-- 82. IV - iv - I - vi (서브도미넌트 마이너 후 vi 안착)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (82, 'IV - iv - I - vi (서브도미넌트 마이너 후 vi 안착)', '["Bridge", "Chorus"]', 'iv 모달 인터체인지의 애절함을 1도 거쳐 감성적인 vi 마이너로 달래주는 극적인 가요 발라드 진행', 89, 89, 'modal_interchange', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(82, 1, 'IV', 'major', NULL, NULL),
(82, 2, 'iv', 'minor', NULL, NULL),
(82, 3, 'I', 'major', NULL, NULL),
(82, 4, 'vi', 'minor', NULL, NULL);

-- 83. vi - IV - ii - V (마이너에서 프리코러스 연결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (83, 'vi - IV - ii - V (마이너에서 프리코러스 연결)', '["Pre-Chorus", "Verse"]', '어두운 마이너에서 4도-2도를 거치며 점점 긴장을 고조시킨 뒤 도미넌트 5도로 열어주는 발라드 빌드업', 88, 92, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(83, 1, 'vi', 'minor', NULL, NULL),
(83, 2, 'IV', 'major', NULL, NULL),
(83, 3, 'ii', 'minor', NULL, NULL),
(83, 4, 'V', 'major', NULL, NULL);

-- 84. I - VI7 - ii - IV (스윙/시티팝 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (84, 'I - VI7 - ii - IV (스윙/시티팝 세컨더리 도미넌트)', '["Verse"]', 'VI7(V/ii)으로 통통 튀는 세련됨을 준 뒤 4도 서브도미넌트로 부드럽게 마무리하는 라운지/시티팝 절 진행', 82, 90, 'secondary_dominant', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(84, 1, 'I', 'major', NULL, NULL),
(84, 2, 'VI', 'dominant', '7', NULL),
(84, 3, 'ii', 'minor', NULL, NULL),
(84, 4, 'IV', 'major', NULL, NULL);

-- 85. IV - II7 - V - I (세컨더리 도미넌트 V/V 완전 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (85, 'IV - II7 - V - I (세컨더리 도미넌트 V/V 완전 종지)', '["Outro", "Chorus"]', '4도에서 5도로 향하는 더블 도미넌트 II7을 배치하여 극적인 설득력과 함께 1도로 안착하는 카덴스', 87, 93, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(85, 1, 'IV', 'major', NULL, NULL),
(85, 2, 'II', 'dominant', '7', NULL),
(85, 3, 'V', 'major', NULL, NULL),
(85, 4, 'I', 'major', NULL, NULL);

-- 86. iii - IV - V - I (다이어토닉 상행 해결 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (86, 'iii - IV - V - I (다이어토닉 상행 해결 턴)', '["Chorus", "Bridge"]', '3도 대리마이너에서 4-5-1로 통쾌하게 상승하며 가슴 벅찬 클라이맥스를 장식하는 앤섬(Anthem) 진행', 86, 92, 'stepwise_ascent', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(86, 1, 'iii', 'minor', NULL, NULL),
(86, 2, 'IV', 'major', NULL, NULL),
(86, 3, 'V', 'major', NULL, NULL),
(86, 4, 'I', 'major', NULL, NULL);

-- 87. I - IV - ii - V (감미로운 R&B / 발라드 절)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (87, 'I - IV - ii - V (감미로운 R&B / 발라드 절)', '["Verse", "Intro"]', '1도에서 서브도미넌트 계열인 4도와 2도를 연달아 지나 5도로 우아하게 마무리하는 웰메이드 발라드 진행', 88, 92, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(87, 1, 'I', 'major', NULL, NULL),
(87, 2, 'IV', 'major', NULL, NULL),
(87, 3, 'ii', 'minor', NULL, NULL),
(87, 4, 'V', 'major', NULL, NULL);

-- 88. bVII - bVI - bVII - I (판타지 / 애니송 클라이맥스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (88, 'bVII - bVI - bVII - I (판타지 / 애니송 클라이맥스)', '["Bridge", "Chorus"]', '모달 인터체인지 코드들을 오가며 웅장한 전장의 비장미와 기적 같은 승리의 희열을 표현하는 진행', 83, 85, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(88, 1, 'bVII', 'major', NULL, NULL),
(88, 2, 'bVI', 'major', NULL, NULL),
(88, 3, 'bVII', 'major', NULL, NULL),
(88, 4, 'I', 'major', NULL, NULL);

-- 89. IV - iii - vi - V (감성 마이너 경유 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (89, 'IV - iii - vi - V (감성 마이너 경유 프리코러스)', '["Pre-Chorus"]', '4도에서 3-6 마이너 라인으로 감정을 차분히 가라앉혔다가 5도 도미넌트로 반전 상승시키는 프리코러스', 89, 92, 'descending_line', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(89, 1, 'IV', 'major', NULL, NULL),
(89, 2, 'iii', 'minor', NULL, NULL),
(89, 3, 'vi', 'minor', NULL, NULL),
(89, 4, 'V', 'major', NULL, NULL);

-- 90. vi - I - V - IV (모던 얼터너티브 팝 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (90, 'vi - I - V - IV (모던 얼터너티브 팝 루프)', '["Verse", "Chorus"]', '어두움과 밝음이 교차하며 4도로 끝나 묘한 여운과 반복성을 주는 트렌디한 얼터너티브 팝 진행', 87, 89, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(90, 1, 'vi', 'minor', NULL, NULL),
(90, 2, 'I', 'major', NULL, NULL),
(90, 3, 'V', 'major', NULL, NULL),
(90, 4, 'IV', 'major', NULL, NULL);

-- 91. I - I/7 - I/b7 - IV (토닉 베이스 하행 클리셰)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (91, 'I - I/7 - I/b7 - IV (토닉 베이스 하행 클리셰)', '["Intro", "Verse"]', '으뜸음 코드가 유지되며 베이스음만 반음씩 내려앉아 IV도로 전환되는 비틀즈풍 클래식 라인 클리셰', 85, 88, 'line_cliche', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(91, 1, 'I', 'major', NULL, NULL),
(91, 2, 'I', 'major', NULL, '7'),
(91, 3, 'I', 'dominant', '7', 'b7'),
(91, 4, 'IV', 'major', NULL, NULL);

-- 92. ii - IV - vi - V (2도 출발 모던 팝 빌드업)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (92, 'ii - IV - vi - V (2도 출발 모던 팝 빌드업)', '["Pre-Chorus", "Verse"]', '2도로 산뜻하게 출발해 4-6-5도로 이어지며 에너지를 깔끔하게 증폭시키는 현대적인 빌드업 진행', 88, 91, 'stepwise_ascent', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(92, 1, 'ii', 'minor', NULL, NULL),
(92, 2, 'IV', 'major', NULL, NULL),
(92, 3, 'vi', 'minor', NULL, NULL),
(92, 4, 'V', 'major', NULL, NULL);

-- 93. IV - V - I/3 - vi (왕도 진행 1도 베이스 전위 서정형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (93, 'IV - V - I/3 - vi (왕도 진행 1도 베이스 전위 서정형)', '["Chorus", "Bridge"]', '왕도 진행의 3번째 마디에 1도의 3음 베이스 전위(C/E)를 적용해 베이스 선율을 아름답게 다듬은 진행', 90, 93, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(93, 1, 'IV', 'major', NULL, NULL),
(93, 2, 'V', 'major', NULL, NULL),
(93, 3, 'I', 'major', NULL, '3'),
(93, 4, 'vi', 'minor', NULL, NULL);

-- 94. bVI - bVII - IV - I (모달 인터체인지 플라갈 안착)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (94, 'bVI - bVII - IV - I (모달 인터체인지 플라갈 안착)', '["Bridge", "Outro"]', '웅장한 모달 인터체인지 진행 후 4도 서브도미넌트를 거쳐 1도로 성스럽고 따스하게 내려앉는 엔딩', 83, 86, 'modal_interchange', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(94, 1, 'bVI', 'major', NULL, NULL),
(94, 2, 'bVII', 'major', NULL, NULL),
(94, 3, 'IV', 'major', NULL, NULL),
(94, 4, 'I', 'major', NULL, NULL);

-- 95. vi - III7 - vi - V (비장한 마이너 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (95, 'vi - III7 - vi - V (비장한 마이너 세컨더리 도미넌트)', '["Bridge", "Intro"]', '마이너 코드 사이에 강력한 III7(V/vi)을 두 번 거치며 비장하고 드라마틱한 감정 폭풍을 몰고 오는 브릿지', 85, 90, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(95, 1, 'vi', 'minor', NULL, NULL),
(95, 2, 'III', 'dominant', '7', NULL),
(95, 3, 'vi', 'minor', NULL, NULL),
(95, 4, 'V', 'major', NULL, NULL);

-- 96. IV - iv - ii - V (서브도미넌트 마이너 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (96, 'IV - iv - ii - V (서브도미넌트 마이너 프리코러스)', '["Pre-Chorus"]', 'iv 모달 인터체인지로 아련함을 고조시킨 후 2-5로 연결해 후렴 진입의 드라마틱한 긴장감을 완성', 88, 91, 'modal_interchange', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(96, 1, 'IV', 'major', NULL, NULL),
(96, 2, 'iv', 'minor', NULL, NULL),
(96, 3, 'ii', 'minor', NULL, NULL),
(96, 4, 'V', 'major', NULL, NULL);
