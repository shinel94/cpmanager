-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 시드 데이터 (배치 2: ID 33~64)
-- 대상 테이블: system_recommendation_progressions, system_progression_steps
-- ==============================================================================

-- 33. ii - V - I - IV (재즈/시티팝 5도 하강 순환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (33, 'ii - V - I - IV (재즈/시티팝 5도 하강 순환)', '["Verse", "Chorus"]', '2-5-1 종지 후 IV도로 시원하게 연결되며 무한 순환 그루브를 만들어내는 세련된 시티팝/재즈 팝 진행', 88, 93, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(33, 1, 'ii', 'minor', NULL, NULL),
(33, 2, 'V', 'major', NULL, NULL),
(33, 3, 'I', 'major', NULL, NULL),
(33, 4, 'IV', 'major', NULL, NULL);

-- 34. vi - V - IV - III7 (안달루시아 카덴스 / 마이너 하강)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (34, 'vi - V - IV - III7 (안달루시아 카덴스 / 마이너 하강)', '["Bridge", "Intro", "Verse"]', '베이스가 단계적으로 하강하다가 III7 도미넌트에서 극적인 스패니시/라틴풍 긴장감을 폭발시키는 비장한 진행', 87, 89, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(34, 1, 'vi', 'minor', NULL, NULL),
(34, 2, 'V', 'major', NULL, NULL),
(34, 3, 'IV', 'major', NULL, NULL),
(34, 4, 'III', 'dominant', '7', NULL);

-- 35. IV - V - vi - V (상행 오픈형 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (35, 'IV - V - vi - V (상행 오픈형 프리코러스)', '["Pre-Chorus"]', '4도부터 6도까지 벅차오르게 상승한 뒤 5도 도미넌트로 시원하게 열어주며 후렴의 강한 낙차를 준비하는 빌드업', 91, 94, 'stepwise_ascent', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(35, 1, 'IV', 'major', NULL, NULL),
(35, 2, 'V', 'major', NULL, NULL),
(35, 3, 'vi', 'minor', NULL, NULL),
(35, 4, 'V', 'major', NULL, NULL);

-- 36. I - I/7 - IV - iv (라인 클리셰 발라드 도입)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (36, 'I - I/7 - IV - iv (라인 클리셰 발라드 도입)', '["Verse", "Intro"]', '1도에서 내음 하강(클리셰) 후 서브도미넌트 마이너(iv)로 부드럽게 감싸는 감성 발라드/어쿠스틱 단골 진행', 86, 88, 'line_cliche', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(36, 1, 'I', 'major', NULL, NULL),
(36, 2, 'I', 'major', NULL, '7'),
(36, 3, 'IV', 'major', NULL, NULL),
(36, 4, 'iv', 'minor', NULL, NULL);

-- 37. IV - V - vi - I (모던 팝 록 에너지 상승 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (37, 'IV - V - vi - I (모던 팝 록 에너지 상승 후렴)', '["Chorus", "Bridge"]', '왕도 진행의 앞부분에서 마지막에 1도로 당당하게 종지하며 록/밴드 사운드의 진취적인 기상을 불어넣는 후렴', 90, 91, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(37, 1, 'IV', 'major', NULL, NULL),
(37, 2, 'V', 'major', NULL, NULL),
(37, 3, 'vi', 'minor', NULL, NULL),
(37, 4, 'I', 'major', NULL, NULL);

-- 38. ii - IV - V - V (프리코러스 오픈 서스펜스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (38, 'ii - IV - V - V (프리코러스 오픈 서스펜스)', '["Pre-Chorus"]', '2도와 4도로 부드럽게 고조된 뒤 5도 도미넌트를 2마디 동안 길게 유지하며 후렴 진입 전 긴장감을 최대치로 채우는 진행', 88, 92, 'tension_build', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(38, 1, 'ii', 'minor', NULL, NULL),
(38, 2, 'IV', 'major', NULL, NULL),
(38, 3, 'V', 'major', NULL, NULL),
(38, 4, 'V', 'major', NULL, NULL);

-- 39. vi - I - IV - V (마이너 감성 모던 포크/팝)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (39, 'vi - I - IV - V (마이너 감성 모던 포크/팝)', '["Verse", "Chorus"]', 'vi도에서 밝은 1도로 도약한 뒤 4-5도로 자연스럽게 전진하는 편안하고 감동적인 팝/포크 진행', 89, 90, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(39, 1, 'vi', 'minor', NULL, NULL),
(39, 2, 'I', 'major', NULL, NULL),
(39, 3, 'IV', 'major', NULL, NULL),
(39, 4, 'V', 'major', NULL, NULL);

-- 40. I - III7 - vi - IV (감정 고조 세컨더리 도미넌트 III7 팝)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (40, 'I - III7 - vi - IV (감정 고조 세컨더리 도미넌트 III7 팝)', '["Chorus", "Bridge"]', '으뜸음에서 3도 도미넌트(V/vi)를 거쳐 vi로 강하게 이끌며 벅차오르는 눈물샘을 자극하는 명곡 전용 후렴 진행', 93, 91, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(40, 1, 'I', 'major', NULL, NULL),
(40, 2, 'III', 'dominant', '7', NULL),
(40, 3, 'vi', 'minor', NULL, NULL),
(40, 4, 'IV', 'major', NULL, NULL);

-- 41. IV - V - vi - vi (서브도미넌트 마이너 쉼표 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (41, 'IV - V - vi - vi (서브도미넌트 마이너 쉼표 후렴)', '["Chorus", "Pre-Chorus"]', '4-5도로 질주하다가 vi도에서 2마디 머물며 멜로디의 감정을 진하게 전달하는 감성 발라드/아이돌 댄스곡 후렴', 89, 87, 'royal_road', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(41, 1, 'IV', 'major', NULL, NULL),
(41, 2, 'V', 'major', NULL, NULL),
(41, 3, 'vi', 'minor', NULL, NULL),
(41, 4, 'vi', 'minor', NULL, NULL);

-- 42. iii - vi - ii - V (정통 5도권 3-6-2-5 서클)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (42, 'iii - vi - ii - V (정통 5도권 3-6-2-5 서클)', '["Verse", "Bridge", "Interlude"]', '완벽한 5도권 역진행으로 유려하고 매끄럽게 흘러가며 다음 마디의 1도를 완벽하게 예고하는 고급 화성 진행', 87, 96, 'circle_of_fifths', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(42, 1, 'iii', 'minor', NULL, NULL),
(42, 2, 'vi', 'minor', NULL, NULL),
(42, 3, 'ii', 'minor', NULL, NULL),
(42, 4, 'V', 'major', NULL, NULL);

-- 43. bVII - IV - I - V (얼터너티브 록/팝 모달 인터체인지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (43, 'bVII - IV - I - V (얼터너티브 록/팝 모달 인터체인지)', '["Chorus", "Intro"]', 'bVII의 거칠고 시원한 록 사운드로 시작해 IV-I로 안착한 뒤 V로 다시 달리는 얼터너티브/인디 록 진행', 84, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(43, 1, 'bVII', 'major', NULL, NULL),
(43, 2, 'IV', 'major', NULL, NULL),
(43, 3, 'I', 'major', NULL, NULL),
(43, 4, 'V', 'major', NULL, NULL);

-- 44. ii - V - I - bVII (2-5-1 후 믹솔리디안 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (44, 'ii - V - I - bVII (2-5-1 후 믹솔리디안 루프)', '["Interlude", "Verse"]', '정석 2-5-1 종지 직후 bVII를 던져주어 색다른 모달 색채를 띠며 루프가 지루하지 않게 환기하는 진행', 82, 89, 'modal_interchange', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(44, 1, 'ii', 'minor', NULL, NULL),
(44, 2, 'V', 'major', NULL, NULL),
(44, 3, 'I', 'major', NULL, NULL),
(44, 4, 'bVII', 'major', NULL, NULL);

-- 45. IV - III7 - vi - V (세컨더리 도미넌트 경유 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (45, 'IV - III7 - vi - V (세컨더리 도미넌트 경유 프리코러스)', '["Pre-Chorus"]', '서브도미넌트에서 III7으로 감정을 끌어올린 뒤 vi-V로 매끄럽게 연결해 후렴의 임팩트를 극대화하는 빌드업', 90, 92, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(45, 1, 'IV', 'major', NULL, NULL),
(45, 2, 'III', 'dominant', '7', NULL),
(45, 3, 'vi', 'minor', NULL, NULL),
(45, 4, 'V', 'major', NULL, NULL);

-- 46. I - V - IV - V (클래식 팝 앤 록 뱀프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (46, 'I - V - IV - V (클래식 팝 앤 록 뱀프)', '["Verse", "Intro"]', '밝고 경쾌한 록앤롤과 브리티시 팝의 경쾌한 리듬감을 가장 직관적으로 보여주는 에너지 넘치는 진행', 85, 89, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(46, 1, 'I', 'major', NULL, NULL),
(46, 2, 'V', 'major', NULL, NULL),
(46, 3, 'IV', 'major', NULL, NULL),
(46, 4, 'V', 'major', NULL, NULL);

-- 47. vi - iii - IV - I (서정적 멜랑콜리 발라드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (47, 'vi - iii - IV - I (서정적 멜랑콜리 발라드)', '["Verse", "Bridge"]', '마이너의 쓸쓸함에서 시작하여 4도를 거쳐 포근한 1도로 안착하는 감성 발라드와 OST 단골 진행', 87, 91, 'canon_family', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(47, 1, 'vi', 'minor', NULL, NULL),
(47, 2, 'iii', 'minor', NULL, NULL),
(47, 3, 'IV', 'major', NULL, NULL),
(47, 4, 'I', 'major', NULL, NULL);

-- 48. IV - I/3 - ii - V (서브도미넌트 하강 베이스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (48, 'IV - I/3 - ii - V (서브도미넌트 하강 베이스)', '["Verse", "Pre-Chorus"]', '베이스가 4도-3음-2도-5도로 자연스럽게 이어지며 우아하고 고급스러운 선율미를 강조하는 진행', 86, 93, 'descending_bass', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(48, 1, 'IV', 'major', NULL, NULL),
(48, 2, 'I', 'major', NULL, '3'),
(48, 3, 'ii', 'minor', NULL, NULL),
(48, 4, 'V', 'major', NULL, NULL);

-- 49. iiø - V7 - vi - vi (평행단조 마이너 2-5-1 모달)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (49, 'iiø - V7 - vi - vi (평행단조 마이너 2-5-1 모달)', '["Bridge"]', '하프 디미니시드(iiø)와 세컨더리 도미넌트(V7/vi)를 거쳐 vi 마이너로 해결되는 치명적이고 짙은 재즈/발라드 브릿지', 81, 87, 'secondary_dominant', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(49, 1, 'vii°', 'half-diminished', 'm7b5', NULL),
(49, 2, 'III', 'dominant', '7', NULL),
(49, 3, 'vi', 'minor', NULL, NULL),
(49, 4, 'vi', 'minor', NULL, NULL);

-- 50. IV - V - I - IV (왕도 출발 후 서브도미넌트 순환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (50, 'IV - V - I - IV (왕도 출발 후 서브도미넌트 순환)', '["Chorus"]', '1도로 해소된 후 다시 4도로 이어지며 끝없이 도는 듯한 청량감과 속도감을 선사하는 아이돌 댄스곡 진행', 91, 92, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(50, 1, 'IV', 'major', NULL, NULL),
(50, 2, 'V', 'major', NULL, NULL),
(50, 3, 'I', 'major', NULL, NULL),
(50, 4, 'IV', 'major', NULL, NULL);

-- 51. I - bIII - IV - I (블루스/록 모달 인터체인지 bIII)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (51, 'I - bIII - IV - I (블루스/록 모달 인터체인지 bIII)', '["Bridge", "Intro"]', 'bIII 코드(단3도)를 기습 투입하여 블루지하고 거친 록 스피릿을 불어넣는 강렬한 모달 인터체인지', 80, 83, 'modal_interchange', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(51, 1, 'I', 'major', NULL, NULL),
(51, 2, 'bIII', 'major', NULL, NULL),
(51, 3, 'IV', 'major', NULL, NULL),
(51, 4, 'I', 'major', NULL, NULL);

-- 52. vi - ii - IV - V (마이너 감성 프리코러스 빌드업)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (52, 'vi - ii - IV - V (마이너 감성 프리코러스 빌드업)', '["Pre-Chorus"]', '차분한 마이너에서 2-4-5도로 점진적으로 밝아지며 후렴의 문을 활짝 열어젖히는 K-Pop 발라드 프리코러스', 89, 93, 'stepwise_ascent', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(52, 1, 'vi', 'minor', NULL, NULL),
(52, 2, 'ii', 'minor', NULL, NULL),
(52, 3, 'IV', 'major', NULL, NULL),
(52, 4, 'V', 'major', NULL, NULL);

-- 53. I - V/7 - vi - IV (파헬벨 베이스 하강 팝 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (53, 'I - V/7 - vi - IV (파헬벨 베이스 하강 팝 변형)', '["Chorus", "Verse"]', '캐논 베이스 하강을 팝 4코드에 접목하여 훨씬 서정적이고 유려한 흐름을 완성한 웰메이드 진행', 92, 94, 'descending_bass', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(53, 1, 'I', 'major', NULL, NULL),
(53, 2, 'V', 'major', NULL, '7'),
(53, 3, 'vi', 'minor', NULL, NULL),
(53, 4, 'IV', 'major', NULL, NULL);

-- 54. IV - V - vi - iii (왕도 진행 3도 오픈형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (54, 'IV - V - vi - iii (왕도 진행 3도 오픈형)', '["Verse", "Chorus"]', '왕도 진행의 후반부를 iii도로 마무리하여 완결짓지 않고 계속해서 곡이 이어지도록 유도하는 서정적 진행', 88, 91, 'royal_road', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(54, 1, 'IV', 'major', NULL, NULL),
(54, 2, 'V', 'major', NULL, NULL),
(54, 3, 'vi', 'minor', NULL, NULL),
(54, 4, 'iii', 'minor', NULL, NULL);

-- 55. ii - IV - I - V (모던 인디 팝 서정 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (55, 'ii - IV - I - V (모던 인디 팝 서정 턴)', '["Verse", "Pre-Chorus"]', '2도 마이너의 담백함으로 시작해 4-1-5로 전개되는 어쿠스틱 인디 팝 감성의 매력적인 코드 진행', 85, 90, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(55, 1, 'ii', 'minor', NULL, NULL),
(55, 2, 'IV', 'major', NULL, NULL),
(55, 3, 'I', 'major', NULL, NULL),
(55, 4, 'V', 'major', NULL, NULL);

-- 56. IV - iv - I - V (서브도미넌트 마이너 후 도미넌트 반전)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (56, 'IV - iv - I - V (서브도미넌트 마이너 후 도미넌트 반전)', '["Pre-Chorus", "Bridge"]', 'iv 모달 인터체인지로 가슴을 저미게 만든 뒤 곧바로 V도미넌트로 반전시켜 카타르시스를 배가하는 진행', 87, 91, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(56, 1, 'IV', 'major', NULL, NULL),
(56, 2, 'iv', 'minor', NULL, NULL),
(56, 3, 'I', 'major', NULL, NULL),
(56, 4, 'V', 'major', NULL, NULL);

-- 57. I - II7 - IV - I (리디안 느낌의 장2도 세컨더리)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (57, 'I - II7 - IV - I (리디안 느낌의 장2도 세컨더리)', '["Bridge", "Verse"]', 'II7(V/V)이 주는 독특한 리디안의 신비롭고 몽환적인 화성 색채가 돋보이는 모던 팝/인디 록 진행', 81, 86, 'secondary_dominant', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(57, 1, 'I', 'major', NULL, NULL),
(57, 2, 'II', 'dominant', '7', NULL),
(57, 3, 'IV', 'major', NULL, NULL),
(57, 4, 'I', 'major', NULL, NULL);

-- 58. vi - V - I - IV (모던 K-Pop 마이너-메이저 혼합)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (58, 'vi - V - I - IV (모던 K-Pop 마이너-메이저 혼합)', '["Chorus", "Verse"]', '마이너의 긴장감에서 1도 해소 후 4도로 시원하게 전진하는 세련된 멜로디 메이킹 전용 진행', 90, 91, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(58, 1, 'vi', 'minor', NULL, NULL),
(58, 2, 'V', 'major', NULL, NULL),
(58, 3, 'I', 'major', NULL, NULL),
(58, 4, 'IV', 'major', NULL, NULL);

-- 59. IV - V - IV - I (서브도미넌트 카덴스 변형 아웃트로)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (59, 'IV - V - IV - I (서브도미넌트 카덴스 변형 아웃트로)', '["Outro"]', '후렴의 열기를 서서히 식히며 마지막 1도로 편안하게 착지하는 자연스러운 아웃트로 전용 진행', 84, 90, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(59, 1, 'IV', 'major', NULL, NULL),
(59, 2, 'V', 'major', NULL, NULL),
(59, 3, 'IV', 'major', NULL, NULL),
(59, 4, 'I', 'major', NULL, NULL);

-- 60. bVI - bVII - vi - V (에픽 모달에서 마이너 전환 브릿지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (60, 'bVI - bVII - vi - V (에픽 모달에서 마이너 전환 브릿지)', '["Bridge"]', '모달 인터체인지로 강한 긴장감을 준 뒤 vi-V로 드라마틱하게 꺾으며 마지막 코러스로 던지는 파워풀 브릿지', 83, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(60, 1, 'bVI', 'major', NULL, NULL),
(60, 2, 'bVII', 'major', NULL, NULL),
(60, 3, 'vi', 'minor', NULL, NULL),
(60, 4, 'V', 'major', NULL, NULL);

-- 61. I - vi - ii - IV (부드러운 포크 발라드 절)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (61, 'I - vi - ii - IV (부드러운 포크 발라드 절)', '["Verse"]', '5도 도미넌트로 경직되게 끝맺지 않고 4도 서브도미넌트로 부드럽게 감싸는 따뜻한 어쿠스틱 Verse', 83, 87, 'standard_turnaround', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(61, 1, 'I', 'major', NULL, NULL),
(61, 2, 'vi', 'minor', NULL, NULL),
(61, 3, 'ii', 'minor', NULL, NULL),
(61, 4, 'IV', 'major', NULL, NULL);

-- 62. ii - iii - IV - IV (프리코러스 서브도미넌트 서스테인 빌드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (62, 'ii - iii - IV - IV (프리코러스 서브도미넌트 서스테인 빌드)', '["Pre-Chorus"]', '스텝와이즈로 상행한 뒤 IV도를 2마디 동안 강하게 타격하며 후렴의 문을 두드리는 록/팝 빌드업', 88, 91, 'stepwise_ascent', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(62, 1, 'ii', 'minor', NULL, NULL),
(62, 2, 'iii', 'minor', NULL, NULL),
(62, 3, 'IV', 'major', NULL, NULL),
(62, 4, 'IV', 'major', NULL, NULL);

-- 63. IV - I - vi - V (서브도미넌트 시작 팝 4코드 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (63, 'IV - I - vi - V (서브도미넌트 시작 팝 4코드 변형)', '["Chorus", "Verse"]', '팝 4코드의 순서를 재배치하여 서브도미넌트로 시원하게 열리고 V도로 완벽하게 다음 순환을 유도하는 진행', 92, 93, 'subdominant_start', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(63, 1, 'IV', 'major', NULL, NULL),
(63, 2, 'I', 'major', NULL, NULL),
(63, 3, 'vi', 'minor', NULL, NULL),
(63, 4, 'V', 'major', NULL, NULL);

-- 64. I - IV - V - I (가장 순수하고 명쾌한 다이어토닉 종지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (64, 'I - IV - V - I (가장 순수하고 명쾌한 다이어토닉 종지)', '["Outro", "Intro", "Verse"]', '음악 기초 이론의 으뜸 카덴스 진행으로, 명쾌함과 동심, 확고한 마침표를 찍는 아웃트로/도입 진행', 90, 95, 'cadence_resolution', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(64, 1, 'I', 'major', NULL, NULL),
(64, 2, 'IV', 'major', NULL, NULL),
(64, 3, 'V', 'major', NULL, NULL),
(64, 4, 'I', 'major', NULL, NULL);
