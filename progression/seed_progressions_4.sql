-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 시드 데이터 (배치 4: ID 97~128)
-- 대상 테이블: system_recommendation_progressions, system_progression_steps
-- ==============================================================================

-- 97. I - V/7 - vi - I/5 (파헬벨 캐논 2단계 베이스 하행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (97, 'I - V/7 - vi - I/5 (파헬벨 캐논 2단계 베이스 하행)', '["Interlude", "Verse"]', '베이스가 1도-7음-6음-5음으로 정통 클래식처럼 우아하게 단계적으로 하강하는 고급 서정 진행', 89, 95, 'descending_bass', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(97, 1, 'I', 'major', NULL, NULL),
(97, 2, 'V', 'major', NULL, '7'),
(97, 3, 'vi', 'minor', NULL, NULL),
(97, 4, 'I', 'major', NULL, '5');

-- 98. ii - V - I - #IVø (시티팝/재즈 텐션 턴어라운드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (98, 'ii - V - I - #IVø (시티팝/재즈 텐션 턴어라운드)', '["Interlude", "Verse"]', '2-5-1 종지 후 #IVø(half-diminished)를 지나 IV-iii로 매끄럽게 연결되는 전형적인 시티팝/퓨전 재즈 기법', 83, 90, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(98, 1, 'ii', 'minor', NULL, NULL),
(98, 2, 'V', 'major', NULL, NULL),
(98, 3, 'I', 'major', NULL, NULL),
(98, 4, '#IV', 'half-diminished', 'm7b5', NULL);

-- 99. IV - V - vi - bVII (에너지 지속 믹솔리디안 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (99, 'IV - V - vi - bVII (에너지 지속 믹솔리디안 루프)', '["Chorus", "Outro"]', '왕도로 질주하다 마지막에 bVII로 시원하게 터뜨리며 지루할 틈 없이 루프를 이어가는 팝 록 후렴/아웃트로', 88, 91, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(99, 1, 'IV', 'major', NULL, NULL),
(99, 2, 'V', 'major', NULL, NULL),
(99, 3, 'vi', 'minor', NULL, NULL),
(99, 4, 'bVII', 'major', NULL, NULL);

-- 100. vi - IV - I - III7 (마이너 세컨더리 도미넌트 회전)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (100, 'vi - IV - I - III7 (마이너 세컨더리 도미넌트 회전)', '["Chorus", "Bridge"]', '감성 마이너 4코드의 끝에 V 대신 III7(V/vi)을 두어 다시 첫머리 vi로 강하게 빨려 들어가는 회전력 부여', 91, 93, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(100, 1, 'vi', 'minor', NULL, NULL),
(100, 2, 'IV', 'major', NULL, NULL),
(100, 3, 'I', 'major', NULL, NULL),
(100, 4, 'III', 'dominant', '7', NULL);

-- 101. I - bVII - bVI - bVII (영웅 서사 록 4코드 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (101, 'I - bVII - bVI - bVII (영웅 서사 록 4코드 루프)', '["Chorus", "Intro"]', '모달 인터체인지를 적극 활용해 광활한 스케일과 벅찬 모험의 테마를 그려내는 애니메이션/게임 OST 전용 진행', 85, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(101, 1, 'I', 'major', NULL, NULL),
(101, 2, 'bVII', 'major', NULL, NULL),
(101, 3, 'bVI', 'major', NULL, NULL),
(101, 4, 'bVII', 'major', NULL, NULL);

-- 102. ii - V - iii - VI7 (5도권 2-5-3-6 세컨더리 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (102, 'ii - V - iii - VI7 (5도권 2-5-3-6 세컨더리 턴)', '["Verse", "Interlude"]', '재즈 팝의 표준 순환 진행으로, 마지막 VI7(V/ii)이 다시 다음 마디의 ii로 자연스럽게 연결되는 영구 순환 화성', 87, 96, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(102, 1, 'ii', 'minor', NULL, NULL),
(102, 2, 'V', 'major', NULL, NULL),
(102, 3, 'iii', 'minor', NULL, NULL),
(102, 4, 'VI', 'dominant', '7', NULL);

-- 103. IV - V - I/3 - IV (우아한 1도 전위 서브도미넌트 회귀)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (103, 'IV - V - I/3 - IV (우아한 1도 전위 서브도미넌트 회귀)', '["Chorus", "Verse"]', '1도의 3음 베이스 전위(C/E)를 거쳐 다시 4도로 부드럽게 돌아오는 서정적이고 몽환적인 멜로디 루프', 89, 92, 'subdominant_start', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(103, 1, 'IV', 'major', NULL, NULL),
(103, 2, 'V', 'major', NULL, NULL),
(103, 3, 'I', 'major', NULL, '3'),
(103, 4, 'IV', 'major', NULL, NULL);

-- 104. vi - V - IV - IV (쓸쓸한 마이너 하강 서스테인)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (104, 'vi - V - IV - IV (쓸쓸한 마이너 하강 서스테인)', '["Verse", "Pre-Chorus"]', '마이너에서 베이스가 4도까지 하강한 뒤 4도를 2마디 동안 길게 끌며 가사의 서정적 메시지에 집중시키는 진행', 86, 89, 'descending_line', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(104, 1, 'vi', 'minor', NULL, NULL),
(104, 2, 'V', 'major', NULL, NULL),
(104, 3, 'IV', 'major', NULL, NULL),
(104, 4, 'IV', 'major', NULL, NULL);

-- 105. I - iii - vi - IV (차분한 다이어토닉 마이너 하강)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (105, 'I - iii - vi - IV (차분한 다이어토닉 마이너 하강)', '["Verse", "Intro"]', '1도에서 대리마이너인 3도와 6도를 순서대로 거치며 편안하게 감정을 정돈하는 포크/어쿠스틱 진행', 87, 91, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(105, 1, 'I', 'major', NULL, NULL),
(105, 2, 'iii', 'minor', NULL, NULL),
(105, 3, 'vi', 'minor', NULL, NULL),
(105, 4, 'IV', 'major', NULL, NULL);

-- 106. IV - iii - ii - ii (완만한 하행 서스테인)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (106, 'IV - iii - ii - ii (완만한 하행 서스테인)', '["Pre-Chorus", "Interlude"]', '4도부터 2도까지 차분하게 내려앉은 뒤 2도를 유지하며 호흡을 가다듬는 차분한 프리코러스/간주', 83, 88, 'descending_line', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(106, 1, 'IV', 'major', NULL, NULL),
(106, 2, 'iii', 'minor', NULL, NULL),
(106, 3, 'ii', 'minor', NULL, NULL),
(106, 4, 'ii', 'minor', NULL, NULL);

-- 107. bVI - IV - I - V (모달 bVI 출발 감성 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (107, 'bVI - IV - I - V (모달 bVI 출발 감성 진행)', '["Chorus", "Bridge"]', '첫 코드부터 모달 인터체인지 bVI를 과감히 던져 몽환적이고 독특한 아우라를 뿜어내는 모던 얼터너티브 후렴', 84, 87, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(107, 1, 'bVI', 'major', NULL, NULL),
(107, 2, 'IV', 'major', NULL, NULL),
(107, 3, 'I', 'major', NULL, NULL),
(107, 4, 'V', 'major', NULL, NULL);

-- 108. ii - V - I - VI7 (경쾌한 2-5-1-6 스윙 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (108, 'ii - V - I - VI7 (경쾌한 2-5-1-6 스윙 턴)', '["Verse", "Interlude"]', '스윙감과 발걸음을 경쾌하게 해주는 전통적인 재즈/브로드웨이 팝 턴어라운드 진행', 86, 95, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(108, 1, 'ii', 'minor', NULL, NULL),
(108, 2, 'V', 'major', NULL, NULL),
(108, 3, 'I', 'major', NULL, NULL),
(108, 4, 'VI', 'dominant', '7', NULL);

-- 109. IV - iv - I - I (아련한 서브도미넌트 마이너 완결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (109, 'IV - iv - I - I (아련한 서브도미넌트 마이너 완결)', '["Outro"]', '4도에서 모달 인터체인지 iv를 거쳐 1도로 완전히 끝나며 가슴 뭉클한 여운을 남기는 클래식 발라드 종지', 88, 90, 'modal_interchange', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(109, 1, 'IV', 'major', NULL, NULL),
(109, 2, 'iv', 'minor', NULL, NULL),
(109, 3, 'I', 'major', NULL, NULL),
(109, 4, 'I', 'major', NULL, NULL);

-- 110. I - II7 - V - I (더블 도미넌트 클래식 팝 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (110, 'I - II7 - V - I (더블 도미넌트 클래식 팝 종지)', '["Outro", "Verse"]', 'II7(V/V) 세컨더리 도미넌트로 경쾌함을 극대화한 뒤 V-I로 확실하게 매듭짓는 밝고 건강한 진행', 87, 94, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(110, 1, 'I', 'major', NULL, NULL),
(110, 2, 'II', 'dominant', '7', NULL),
(110, 3, 'V', 'major', NULL, NULL),
(110, 4, 'I', 'major', NULL, NULL);

-- 111. vi - bVI - V - V (반음 하강 도미넌트 페달 긴장)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (111, 'vi - bVI - V - V (반음 하강 도미넌트 페달 긴장)', '["Pre-Chorus", "Bridge"]', '마이너에서 반음씩 하강하다가 도미넌트 5도를 2마디 동안 유지하며 심장을 멎게 할 듯한 서스펜스를 유발', 85, 90, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(111, 1, 'vi', 'minor', NULL, NULL),
(111, 2, 'bVI', 'major', NULL, NULL),
(111, 3, 'V', 'major', NULL, NULL),
(111, 4, 'V', 'major', NULL, NULL);

-- 112. IV - V - IV - IV (프리코러스 4도 서스테인)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (112, 'IV - V - IV - IV (프리코러스 4도 서스테인)', '["Pre-Chorus", "Outro"]', '4-5도로 살짝 고조시킨 후 다시 4도 서브도미넌트로 감싸며 후렴 직전 공간을 비워주는 미니멀 빌드업', 84, 88, 'subdominant_start', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(112, 1, 'IV', 'major', NULL, NULL),
(112, 2, 'V', 'major', NULL, NULL),
(112, 3, 'IV', 'major', NULL, NULL),
(112, 4, 'IV', 'major', NULL, NULL);

-- 113. I - IV - vi - IV (밝고 명랑한 인디 팝 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (113, 'I - IV - vi - IV (밝고 명랑한 인디 팝 루프)', '["Chorus", "Verse"]', '도미넌트(V)의 긴장감을 배제하고 1-4-6-4로 편안하고 청량하게 반복 순환하는 모던 인디/신스팝 진행', 88, 89, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(113, 1, 'I', 'major', NULL, NULL),
(113, 2, 'IV', 'major', NULL, NULL),
(113, 3, 'vi', 'minor', NULL, NULL),
(113, 4, 'IV', 'major', NULL, NULL);

-- 114. ii - V - I/3 - IV (2-5 후 1도 1전위 4도 연결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (114, 'ii - V - I/3 - IV (2-5 후 1도 1전위 4도 연결)', '["Interlude", "Verse"]', '2-5 진행 뒤 1도의 3음 베이스(C/E)를 징검다리 삼아 4도로 물 흐르듯 이어지는 고급 재즈 팝 편곡 기법', 86, 95, 'descending_bass', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(114, 1, 'ii', 'minor', NULL, NULL),
(114, 2, 'V', 'major', NULL, NULL),
(114, 3, 'I', 'major', NULL, '3'),
(114, 4, 'IV', 'major', NULL, NULL);

-- 115. bVII - IV - V - I (믹솔리디안 도미넌트 해결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (115, 'bVII - IV - V - I (믹솔리디안 도미넌트 해결)', '["Chorus", "Outro"]', 'bVII의 자유로운 록 감성에서 4-5-1 정통 카덴스로 깔끔하게 마무리되는 통쾌하고 강렬한 진행', 86, 92, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(115, 1, 'bVII', 'major', NULL, NULL),
(115, 2, 'IV', 'major', NULL, NULL),
(115, 3, 'V', 'major', NULL, NULL),
(115, 4, 'I', 'major', NULL, NULL);

-- 116. IV - iv - vi - V (서브도미넌트 마이너 후 5도 전환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (116, 'IV - iv - vi - V (서브도미넌트 마이너 후 5도 전환)', '["Pre-Chorus", "Bridge"]', 'iv 모달 인터체인지로 가슴을 울린 뒤 vi 마이너를 거쳐 5도로 치솟으며 후렴으로 던져주는 극적 빌드업', 87, 91, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(116, 1, 'IV', 'major', NULL, NULL),
(116, 2, 'iv', 'minor', NULL, NULL),
(116, 3, 'vi', 'minor', NULL, NULL),
(116, 4, 'V', 'major', NULL, NULL);

-- 117. I - V - ii - IV (팝 2도 대리코드 전환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (117, 'I - V - ii - IV (팝 2도 대리코드 전환)', '["Verse", "Chorus"]', '전형적인 팝 4코드의 6도 대신 2도를 사용하여 한층 더 담백하고 풋풋한 청춘의 느낌을 주는 팝 진행', 89, 91, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(117, 1, 'I', 'major', NULL, NULL),
(117, 2, 'V', 'major', NULL, NULL),
(117, 3, 'ii', 'minor', NULL, NULL),
(117, 4, 'IV', 'major', NULL, NULL);

-- 118. vi - IV - V - V (마이너 5도 페달 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (118, 'vi - IV - V - V (마이너 5도 페달 프리코러스)', '["Pre-Chorus"]', '마이너에서 4도로 상승 후 5도 도미넌트를 2마디 동안 단단하게 밟으며 코러스 직전 폭발력을 축적', 90, 93, 'tension_build', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(118, 1, 'vi', 'minor', NULL, NULL),
(118, 2, 'IV', 'major', NULL, NULL),
(118, 3, 'V', 'major', NULL, NULL),
(118, 4, 'V', 'major', NULL, NULL);

-- 119. iii - vi - IV - V (서정적 3-6에서 4-5 상승)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (119, 'iii - vi - IV - V (서정적 3-6에서 4-5 상승)', '["Pre-Chorus", "Verse"]', '3-6의 차분하고 은은한 마이너 라인에서 4-5로 밝게 솟구쳐 오르는 드라마틱한 빌드업 진행', 87, 92, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(119, 1, 'iii', 'minor', NULL, NULL),
(119, 2, 'vi', 'minor', NULL, NULL),
(119, 3, 'IV', 'major', NULL, NULL),
(119, 4, 'V', 'major', NULL, NULL);

-- 120. IV - V - iii - I (왕도 1도 안착 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (120, 'IV - V - iii - I (왕도 1도 안착 변형)', '["Chorus", "Outro"]', '왕도 진행에서 마지막을 vi 대신 으뜸음(I)으로 안착시켜 따뜻함과 편안한 종지감을 주는 변형', 88, 91, 'royal_road', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(120, 1, 'IV', 'major', NULL, NULL),
(120, 2, 'V', 'major', NULL, NULL),
(120, 3, 'iii', 'minor', NULL, NULL),
(120, 4, 'I', 'major', NULL, NULL);

-- 121. I - bVI - IV - V (모달 bVI의 극적 대비 빌드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (121, 'I - bVI - IV - V (모달 bVI의 극적 대비 빌드)', '["Pre-Chorus", "Bridge"]', '1도에서 bVI로 순간적인 영화적 반전을 준 뒤 4-5도로 후렴 진입의 문을 활짝 여는 진행', 84, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(121, 1, 'I', 'major', NULL, NULL),
(121, 2, 'bVI', 'major', NULL, NULL),
(121, 3, 'IV', 'major', NULL, NULL),
(121, 4, 'V', 'major', NULL, NULL);

-- 122. ii - V - I - IVmaj7 (시티팝 인터루드/아웃트로 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (122, 'ii - V - I - IVmaj7 (시티팝 인터루드/아웃트로 루프)', '["Interlude", "Outro"]', '정석 2-5-1 해결 후 IVmaj7으로 떠오르듯 마무리하며 도시적인 야경과 세련된 그루브를 남기는 루프', 88, 93, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(122, 1, 'ii', 'minor', NULL, NULL),
(122, 2, 'V', 'major', NULL, NULL),
(122, 3, 'I', 'major', NULL, NULL),
(122, 4, 'IV', 'major', 'maj7', NULL);

-- 123. vi - ii - IV - I (마이너 4-1 플라갈 해결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (123, 'vi - ii - IV - I (마이너 4-1 플라갈 해결)', '["Verse", "Outro"]', '어두운 마이너에서 시작해 서브도미넌트를 거쳐 1도로 고요하게 촛불이 꺼지듯 안착하는 아웃트로', 85, 89, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(123, 1, 'vi', 'minor', NULL, NULL),
(123, 2, 'ii', 'minor', NULL, NULL),
(123, 3, 'IV', 'major', NULL, NULL),
(123, 4, 'I', 'major', NULL, NULL);

-- 124. IV - III7 - vi - I (세컨더리 도미넌트 1도 상승)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (124, 'IV - III7 - vi - I (세컨더리 도미넌트 1도 상승)', '["Chorus", "Bridge"]', 'III7(V/vi)으로 긴장을 고조시킨 후 vi에서 1도로 밝게 피어오르며 끝맺는 화려한 J-Pop/K-Pop 후렴', 91, 91, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(124, 1, 'IV', 'major', NULL, NULL),
(124, 2, 'III', 'dominant', '7', NULL),
(124, 3, 'vi', 'minor', NULL, NULL),
(124, 4, 'I', 'major', NULL, NULL);

-- 125. I - IV - V - Vsus4 (미완결 여운형 인터루드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (125, 'I - IV - V - Vsus4 (미완결 여운형 인터루드)', '["Interlude", "Intro"]', '마지막 마디에서 Vsus4로 긴장을 잔잔하게 유지하며 다음 보컬 파트나 메인 테마의 진입을 예비', 83, 90, 'tension_build', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(125, 1, 'I', 'major', NULL, NULL),
(125, 2, 'IV', 'major', NULL, NULL),
(125, 3, 'V', 'major', NULL, NULL),
(125, 4, 'V', 'major', 'sus4', NULL);

-- 126. bVI - bVII - I - V (에픽 모달 후 도미넌트 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (126, 'bVI - bVII - I - V (에픽 모달 후 도미넌트 루프)', '["Bridge", "Pre-Chorus"]', '마리오 카덴스로 1도까지 도달한 뒤 V도로 전환하여 다시 코러스로 돌진할 수 있는 강력한 추진력 형성', 87, 92, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(126, 1, 'bVI', 'major', NULL, NULL),
(126, 2, 'bVII', 'major', NULL, NULL),
(126, 3, 'I', 'major', NULL, NULL),
(126, 4, 'V', 'major', NULL, NULL);

-- 127. ii - IV - V - I (정석 다이어토닉 카덴스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (127, 'ii - IV - V - I (정석 다이어토닉 카덴스)', '["Outro", "Verse"]', '서브도미넌트(ii, IV)와 도미넌트(V), 토닉(I)이 교과서적으로 배열되어 가장 단정하고 깔끔한 마침표를 제공', 89, 95, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(127, 1, 'ii', 'minor', NULL, NULL),
(127, 2, 'IV', 'major', NULL, NULL),
(127, 3, 'V', 'major', NULL, NULL),
(127, 4, 'I', 'major', NULL, NULL);

-- 128. IV - iv - I - IV (서브도미넌트 마이너 순환 뱀프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (128, 'IV - iv - I - IV (서브도미넌트 마이너 순환 뱀프)', '["Outro", "Intro"]', 'iv를 거쳐 1도로 왔다가 다시 4도로 이어지며 끝없이 아련한 페이드아웃 감성을 자아내는 아웃트로 뱀프', 85, 87, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(128, 1, 'IV', 'major', NULL, NULL),
(128, 2, 'iv', 'minor', NULL, NULL),
(128, 3, 'I', 'major', NULL, NULL),
(128, 4, 'IV', 'major', NULL, NULL);
