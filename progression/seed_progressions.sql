-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 시드 데이터
-- 대상 테이블: system_recommendation_progressions, system_progression_steps
-- ==============================================================================

-- 1. I - V - vi - IV (팝 4코드 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (1, 'I - V - vi - IV (팝 4코드 진행)', '["Chorus", "Intro", "Outro"]', '전 세계 수많은 메가 히트 팝, 록, K-Pop 곡의 후렴구에 사용되는 가장 대중적이고 캐치한 다이어토닉 4코드 진행', 98, 95, 'diatonic_pop', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(1, 1, 'I', 'major', NULL, NULL),
(1, 2, 'V', 'major', NULL, NULL),
(1, 3, 'vi', 'minor', NULL, NULL),
(1, 4, 'IV', 'major', NULL, NULL);

-- 2. IV - V - iii - vi (왕도 진행 / 코마로)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (2, 'IV - V - iii - vi (왕도 진행 / 코마로)', '["Chorus", "Bridge", "Intro"]', '서브도미넌트 출발로 시원하게 터지며 애절함과 고조감을 동시에 주는 J-Pop/K-Pop 최고의 황금 후렴 진행', 96, 92, 'royal_road', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(2, 1, 'IV', 'major', NULL, NULL),
(2, 2, 'V', 'major', NULL, NULL),
(2, 3, 'iii', 'minor', NULL, NULL),
(2, 4, 'vi', 'minor', NULL, NULL);

-- 3. vi - IV - I - V (감성 마이너 시작 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (3, 'vi - IV - I - V (감성 마이너 시작 진행)', '["Chorus", "Verse", "Intro"]', '어둡고 서정적인 vi도로 시작해 점차 밝아지며 후반부에 강한 추진력을 얻는 모던 팝/발라드 진행', 94, 90, 'diatonic_pop', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(3, 1, 'vi', 'minor', NULL, NULL),
(3, 2, 'IV', 'major', NULL, NULL),
(3, 3, 'I', 'major', NULL, NULL),
(3, 4, 'V', 'major', NULL, NULL);

-- 4. ii - iii - IV - V (스텝와이즈 상행 빌드업)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (4, 'ii - iii - IV - V (스텝와이즈 상행 빌드업)', '["Pre-Chorus"]', '한 도수씩 차례대로 상행하며 긴장감과 에너지를 극대화하여 코러스(후렴) 직전의 폭발력을 유도하는 대표적인 프리코러스 진행', 95, 93, 'stepwise_ascent', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(4, 1, 'ii', 'minor', NULL, NULL),
(4, 2, 'iii', 'minor', NULL, NULL),
(4, 3, 'IV', 'major', NULL, NULL),
(4, 4, 'V', 'major', NULL, NULL);

-- 5. I - V - vi - iii (캐논 전반부 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (5, 'I - V - vi - iii (캐논 전반부 진행)', '["Verse", "Intro"]', '클래식 파헬벨 캐논의 전반부 진행으로, 안정적이고 서정적인 멜로디 전개에 최적화된 Verse 표준 진행', 92, 94, 'canon_family', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(5, 1, 'I', 'major', NULL, NULL),
(5, 2, 'V', 'major', NULL, NULL),
(5, 3, 'vi', 'minor', NULL, NULL),
(5, 4, 'iii', 'minor', NULL, NULL);

-- 6. IV - I - V - vi (서브도미넌트 서정 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (6, 'IV - I - V - vi (서브도미넌트 서정 후렴)', '["Chorus", "Bridge"]', '서브도미넌트(IV)로 열린 뒤 으뜸음(I)을 거쳐 vi로 안착하는 편안하면서도 아련한 감정선의 팝 후렴 진행', 91, 88, 'subdominant_start', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(6, 1, 'IV', 'major', NULL, NULL),
(6, 2, 'I', 'major', NULL, NULL),
(6, 3, 'V', 'major', NULL, NULL),
(6, 4, 'vi', 'minor', NULL, NULL);

-- 7. IV - V - IV - V (프리코러스 교차 텐션)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (7, 'IV - V - IV - V (프리코러스 교차 텐션)', '["Pre-Chorus"]', '서브도미넌트와 도미넌트를 2회 반복하며 긴장감을 계단식으로 증폭시켜 후렴 진입을 예열하는 프리코러스 진행', 89, 92, 'tension_build', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(7, 1, 'IV', 'major', NULL, NULL),
(7, 2, 'V', 'major', NULL, NULL),
(7, 3, 'IV', 'major', NULL, NULL),
(7, 4, 'V', 'major', NULL, NULL);

-- 8. IV - V - III7 - vi (세컨더리 도미넌트 왕도 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (8, 'IV - V - III7 - vi (세컨더리 도미넌트 왕도 변형)', '["Chorus", "Bridge"]', 'iii 대신 vi의 세컨더리 도미넌트(III7)를 배치하여 드라마틱한 긴장감과 강력한 해결감을 부여하는 고급 가요/애니송 진행', 92, 89, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(8, 1, 'IV', 'major', NULL, NULL),
(8, 2, 'V', 'major', NULL, NULL),
(8, 3, 'III', 'dominant', '7', NULL),
(8, 4, 'vi', 'minor', NULL, NULL);

-- 9. vi - V - IV - V (마이너 하강 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (9, 'vi - V - IV - V (마이너 하강 프리코러스)', '["Pre-Chorus", "Verse"]', '마이너에서 베이스가 차례로 하강한 뒤 마지막 마디 도미넌트(V)에서 호흡을 가다듬고 코러스를 준비하는 감성 진행', 90, 91, 'descending_line', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(9, 1, 'vi', 'minor', NULL, NULL),
(9, 2, 'V', 'major', NULL, NULL),
(9, 3, 'IV', 'major', NULL, NULL),
(9, 4, 'V', 'major', NULL, NULL);

-- 10. IV - V - I - vi (왕도 진행 1도 종지형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (10, 'IV - V - I - vi (왕도 진행 1도 종지형)', '["Chorus", "Pre-Chorus"]', '3번째 마디에서 으뜸음(I)으로 시원하게 해소된 뒤 vi로 여운을 남기는 J-Pop/K-Pop 히트곡 단골 진행', 93, 90, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(10, 1, 'IV', 'major', NULL, NULL),
(10, 2, 'V', 'major', NULL, NULL),
(10, 3, 'I', 'major', NULL, NULL),
(10, 4, 'vi', 'minor', NULL, NULL);

-- 11. I - vi - IV - V (50s 둘룹 스탠다드 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (11, 'I - vi - IV - V (50s 둘룹 스탠다드 진행)', '["Verse", "Intro"]', '50년대 두왑부터 현대 발라드까지 편안하고 친근한 감성을 전달하는 영원한 스탠다드 순환 진행', 88, 90, 'standard_turnaround', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(11, 1, 'I', 'major', NULL, NULL),
(11, 2, 'vi', 'minor', NULL, NULL),
(11, 3, 'IV', 'major', NULL, NULL),
(11, 4, 'V', 'major', NULL, NULL);

-- 12. ii - V - I - vi (재즈/R&B 턴어라운드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (12, 'ii - V - I - vi (재즈/R&B 턴어라운드)', '["Verse", "Interlude"]', '재즈와 R&B, 세련된 시티팝에서 부드러운 서사를 풀어낼 때 가장 안정적인 5도권 순환 진행', 86, 95, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(12, 1, 'ii', 'minor', NULL, NULL),
(12, 2, 'V', 'major', NULL, NULL),
(12, 3, 'I', 'major', NULL, NULL),
(12, 4, 'vi', 'minor', NULL, NULL);

-- 13. bVI - bVII - I - I (마리오 카덴스 / 웅장한 모달 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (13, 'bVI - bVII - I - I (마리오 카덴스 / 웅장한 모달 진행)', '["Bridge", "Chorus", "Outro"]', '모달 인터체인지 bVI와 bVII를 연속 사용하여 승리감, 벅차오름, 웅장한 해결감을 선사하는 브릿지/후렴 진행', 85, 82, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(13, 1, 'bVI', 'major', NULL, NULL),
(13, 2, 'bVII', 'major', NULL, NULL),
(13, 3, 'I', 'major', NULL, NULL),
(13, 4, 'I', 'major', NULL, NULL);

-- 14. IV - iv - I - I (서브도미넌트 마이너 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (14, 'IV - iv - I - I (서브도미넌트 마이너 종지)', '["Bridge", "Outro"]', '장조 IV에서 모달 인터체인지인 iv 마이너로 반음 하강하여 가슴 시린 애절함을 연출하는 브릿지 및 아웃트로 진행', 87, 86, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(14, 1, 'IV', 'major', NULL, NULL),
(14, 2, 'iv', 'minor', NULL, NULL),
(14, 3, 'I', 'major', NULL, NULL),
(14, 4, 'I', 'major', NULL, NULL);

-- 15. I - V/7 - vi - V (베이스 하강 순차 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (15, 'I - V/7 - vi - V (베이스 하강 순차 진행)', '["Verse", "Intro"]', '슬래시 코드를 사용해 베이스 음이 자연스럽게 하강(1도-7음-6음-5음)하여 우아하고 서정적인 분위기를 자아내는 Verse 진행', 84, 91, 'descending_bass', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(15, 1, 'I', 'major', NULL, NULL),
(15, 2, 'V', 'major', NULL, '7'),
(15, 3, 'vi', 'minor', NULL, NULL),
(15, 4, 'V', 'major', NULL, NULL);

-- 16. IV - V - I - I (명확한 도미넌트 완결 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (16, 'IV - V - I - I (명확한 도미넌트 완결 종지)', '["Chorus", "Outro"]', '서브도미넌트에서 도미넌트를 거쳐 으뜸음으로 완전히 해결되는 가장 확실하고 깔끔한 카덴스 후렴/아웃트로 진행', 88, 94, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(16, 1, 'IV', 'major', NULL, NULL),
(16, 2, 'V', 'major', NULL, NULL),
(16, 3, 'I', 'major', NULL, NULL),
(16, 4, 'I', 'major', NULL, NULL);

-- 17. IV - iii - ii - V (하행 후 도미넌트 전환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (17, 'IV - iii - ii - V (하행 후 도미넌트 전환)', '["Pre-Chorus"]', '서브도미넌트(IV)에서 ii도까지 순차 하행하며 편안함을 준 뒤 마지막 V도로 반전을 주며 후렴을 유도하는 프리코러스 진행', 90, 93, 'descending_line', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(17, 1, 'IV', 'major', NULL, NULL),
(17, 2, 'iii', 'minor', NULL, NULL),
(17, 3, 'ii', 'minor', NULL, NULL),
(17, 4, 'V', 'major', NULL, NULL);

-- 18. I - IV - vi - V (경쾌한 모던 팝 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (18, 'I - IV - vi - V (경쾌한 모던 팝 진행)', '["Chorus", "Verse"]', '서브도미넌트로 먼저 도약한 뒤 감성적인 vi와 밝은 V로 순환하는 발랄하고 에너지 넘치는 팝/인디 록 진행', 89, 90, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(18, 1, 'I', 'major', NULL, NULL),
(18, 2, 'IV', 'major', NULL, NULL),
(18, 3, 'vi', 'minor', NULL, NULL),
(18, 4, 'V', 'major', NULL, NULL);

-- 19. ii - V - iii - vi (네오소울 / R&B 2-5-3-6)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (19, 'ii - V - iii - vi (네오소울 / R&B 2-5-3-6)', '["Verse", "Interlude", "Chorus"]', '2-5-1의 변형으로 1도 대신 대리코드 iii-vi를 사용하여 세련되고 부드러운 그루브를 만들어내는 R&B/시티팝 진행', 88, 91, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(19, 1, 'ii', 'minor', NULL, NULL),
(19, 2, 'V', 'major', NULL, NULL),
(19, 3, 'iii', 'minor', NULL, NULL),
(19, 4, 'vi', 'minor', NULL, NULL);

-- 20. I - bVII - IV - I (믹솔리디안 록/어반 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (20, 'I - bVII - IV - I (믹솔리디안 록/어반 진행)', '["Bridge", "Outro", "Chorus"]', 'bVII 코드를 사용하여 록, 포크, 어반 팝의 자유롭고 시원한 믹솔리디안 모달 사운드를 연출하는 진행', 86, 87, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(20, 1, 'I', 'major', NULL, NULL),
(20, 2, 'bVII', 'major', NULL, NULL),
(20, 3, 'IV', 'major', NULL, NULL),
(20, 4, 'I', 'major', NULL, NULL);

-- 21. IV - iv - iii - vi (서브도미넌트 마이너 브릿지 클라이맥스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (21, 'IV - iv - iii - vi (서브도미넌트 마이너 브릿지 클라이맥스)', '["Bridge"]', '브릿지 구간에서 강렬한 감정의 변화와 눈물샘을 자극하는 모달 인터체인지 iv를 결합한 극적 전환 진행', 88, 86, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(21, 1, 'IV', 'major', NULL, NULL),
(21, 2, 'iv', 'minor', NULL, NULL),
(21, 3, 'iii', 'minor', NULL, NULL),
(21, 4, 'vi', 'minor', NULL, NULL);

-- 22. I - VI7 - ii - V (세컨더리 도미넌트 순환 스탠다드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (22, 'I - VI7 - ii - V (세컨더리 도미넌트 순환 스탠다드)', '["Verse", "Intro"]', 'vi 대신 2도로 향하는 세컨더리 도미넌트 VI7을 배치하여 밝고 스윙감 넘치는 재즈/팝 색채를 표현하는 Verse 진행', 82, 92, 'secondary_dominant', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(22, 1, 'I', 'major', NULL, NULL),
(22, 2, 'VI', 'dominant', '7', NULL),
(22, 3, 'ii', 'minor', NULL, NULL),
(22, 4, 'V', 'major', NULL, NULL);

-- 23. I - IV - I - V (어쿠스틱 포크/팝 클래식)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (23, 'I - IV - I - V (어쿠스틱 포크/팝 클래식)', '["Verse", "Intro"]', '1도와 4도를 부드럽게 오가며 담백하고 소박한 화성을 구축하는 포크/어쿠스틱/컨트리 계열 Verse 진행', 83, 88, 'diatonic_pop', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(23, 1, 'I', 'major', NULL, NULL),
(23, 2, 'IV', 'major', NULL, NULL),
(23, 3, 'I', 'major', NULL, NULL),
(23, 4, 'V', 'major', NULL, NULL);

-- 24. I - ii - iii - IV (몽환적 상행 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (24, 'I - ii - iii - IV (몽환적 상행 진행)', '["Verse", "Pre-Chorus"]', '1도부터 4도까지 차분하게 계단을 오르듯 상승하며 꿈결 같고 기대감을 조성하는 감성적 진행', 84, 89, 'stepwise_ascent', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(24, 1, 'I', 'major', NULL, NULL),
(24, 2, 'ii', 'minor', NULL, NULL),
(24, 3, 'iii', 'minor', NULL, NULL),
(24, 4, 'IV', 'major', NULL, NULL);

-- 25. vi - ii - V - I (마이너 스타트 5도권 순환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (25, 'vi - ii - V - I (마이너 스타트 5도권 순환)', '["Verse", "Bridge"]', 'vi도에서 시작해 5도 간격으로 완전하게 해결되며 으뜸음(I)으로 귀환하는 고전적이고 안정적인 전개', 87, 94, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(25, 1, 'vi', 'minor', NULL, NULL),
(25, 2, 'ii', 'minor', NULL, NULL),
(25, 3, 'V', 'major', NULL, NULL),
(25, 4, 'I', 'major', NULL, NULL);

-- 26. II7 - V - I - vi (더블 도미넌트 브릿지 전환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (26, 'II7 - V - I - vi (더블 도미넌트 브릿지 전환)', '["Bridge", "Interlude"]', 'V도로 해결되는 세컨더리 도미넌트 II7(V/V)을 첫머리에 내세워 색다른 긴장감으로 분위기를 완전히 환기시키는 진행', 80, 90, 'secondary_dominant', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(26, 1, 'II', 'dominant', '7', NULL),
(26, 2, 'V', 'major', NULL, NULL),
(26, 3, 'I', 'major', NULL, NULL),
(26, 4, 'vi', 'minor', NULL, NULL);

-- 27. I - bVI - bVII - I (모달 록 앤서 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (27, 'I - bVI - bVII - I (모달 록 앤서 후렴)', '["Chorus", "Bridge"]', '1도에서 급격히 동주음 단조의 bVI와 bVII로 전환했다가 1도로 돌아오는 파워풀하고 장엄한 록/서사적 팝 진행', 86, 85, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(27, 1, 'I', 'major', NULL, NULL),
(27, 2, 'bVI', 'major', NULL, NULL),
(27, 3, 'bVII', 'major', NULL, NULL),
(27, 4, 'I', 'major', NULL, NULL);

-- 28. IV - iii - ii - I (다이어토닉 스텝 하행 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (28, 'IV - iii - ii - I (다이어토닉 스텝 하행 종지)', '["Pre-Chorus", "Outro"]', '4도에서 1도까지 완만하고 아름답게 내려앉으며 아련한 여운을 남기는 프리코러스 및 아웃트로 진행', 85, 88, 'descending_line', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(28, 1, 'IV', 'major', NULL, NULL),
(28, 2, 'iii', 'minor', NULL, NULL),
(28, 3, 'ii', 'minor', NULL, NULL),
(28, 4, 'I', 'major', NULL, NULL);

-- 29. I - IV - I - IV (2코드 어쿠스틱 뱀프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (29, 'I - IV - I - IV (2코드 어쿠스틱 뱀프)', '["Intro", "Verse"]', '미니멀하고 단순한 1도와 4도의 왕복으로 보컬과 멜로디의 집중도를 극대화하는 인트로 및 잔잔한 Verse 진행', 81, 85, 'vamp', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(29, 1, 'I', 'major', NULL, NULL),
(29, 2, 'IV', 'major', NULL, NULL),
(29, 3, 'I', 'major', NULL, NULL),
(29, 4, 'IV', 'major', NULL, NULL);

-- 30. vi - IV - vi - IV (어두운 감성 뱀프 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (30, 'vi - IV - vi - IV (어두운 감성 뱀프 루프)', '["Intro", "Interlude"]', '단조로운 듯하면서도 무거운 분위기를 잡아주는 힙합/트랩/얼터너티브 계열의 마이너 뱀프 루프', 79, 84, 'vamp', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(30, 1, 'vi', 'minor', NULL, NULL),
(30, 2, 'IV', 'major', NULL, NULL),
(30, 3, 'vi', 'minor', NULL, NULL),
(30, 4, 'IV', 'major', NULL, NULL);

-- 31. IV - V - Vsus4 - V (도미넌트 서스펜스 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (31, 'IV - V - Vsus4 - V (도미넌트 서스펜스 프리코러스)', '["Pre-Chorus"]', '마지막 2마디에서 Vsus4와 V를 사용하여 긴장감의 정점을 찍고 후렴으로 달려가는 프리코러스 클라이맥스 진행', 86, 92, 'tension_build', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(31, 1, 'IV', 'major', NULL, NULL),
(31, 2, 'V', 'major', NULL, NULL),
(31, 3, 'V', 'major', 'sus4', NULL),
(31, 4, 'V', 'major', NULL, NULL);

-- 32. ii - V - I - I (스탠다드 재즈 팝 2-5-1)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (32, 'ii - V - I - I (스탠다드 재즈 팝 2-5-1)', '["Verse", "Outro", "Chorus"]', '가장 기본적이면서 완성도 높은 2-5-1 해결 진행으로, 으뜸음을 2마디 유지하여 확고한 안정감을 선사', 89, 94, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(32, 1, 'ii', 'minor', NULL, NULL),
(32, 2, 'V', 'major', NULL, NULL),
(32, 3, 'I', 'major', NULL, NULL),
(32, 4, 'I', 'major', NULL, NULL);
