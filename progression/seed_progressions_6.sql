-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 추가 시드 데이터 (배치 6: ID 161~192)
-- 카테고리:
--  1) J-Rock / J-Band (백넘버, 험브레더스, 하쿠) (ID 161~168)
--  2) K-Pop 아이돌 전형 진행 (청량/걸크러시/이지리스닝) (ID 169~176)
--  3) 일본 우타이테 / 보컬로이드 (마루사/오모테/고속질주) (ID 177~184)
--  4) 팝 펑크 & 브릿팝 밴드 (그린데이, 오아시스) (ID 185~192)
-- 대상 테이블: system_recommendation_progressions, system_progression_form_tags, system_progression_steps
-- ==============================================================================

-- 161. IV - V - vi - I (J-Rock 코마로 1도 리턴형)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (161, 'IV - V - vi - I (J-Rock 코마로 1도 리턴형)', '백넘버(back number), 하쿠(Haku) 등에서 코러스의 폭발적인 질주와 개방감을 만드는 4-5-6-1 앤섬 진행', 96, 93, 'jrock_anthem', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 161;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (161, 'Chorus'), (161, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 161;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(161, 1, 'IV', 'major', NULL, NULL),
(161, 2, 'V', 'major', NULL, NULL),
(161, 3, 'vi', 'minor', NULL, NULL),
(161, 4, 'I', 'major', NULL, NULL);

-- 162. IV - V - III7 - vi (감성 밴드 세컨더리 도미넌트)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (162, 'IV - V - III7 - vi (감성 밴드 세컨더리 도미넌트)', '백넘버 서정 발라드/록의 시그니처 진행으로, III7의 장3음이 vi단조로 강력하게 이끌며 애절함을 극대화하는 진행', 95, 92, 'secondary_dominant', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 162;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (162, 'Chorus'), (162, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 162;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(162, 1, 'IV', 'major', NULL, NULL),
(162, 2, 'V', 'major', NULL, NULL),
(162, 3, 'III', 'dominant', '7', NULL),
(162, 4, 'vi', 'minor', NULL, NULL);

-- 163. I - V/7 - vi - IV (하강 베이스 이모코어 록 캐논)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (163, 'I - V/7 - vi - IV (하강 베이스 이모코어 록 캐논)', '험브레더스(Hump Back), 백넘버의 벌스/코러스에서 베이스가 반음씩 순차 하강하며 묵직한 청춘의 감정을 쏟아내는 진행', 92, 94, 'descending_bass', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 163;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (163, 'Verse'), (163, 'Chorus'), (163, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 163;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(163, 1, 'I', 'major', NULL, NULL),
(163, 2, 'V', 'major', NULL, 'VII'),
(163, 3, 'vi', 'minor', NULL, NULL),
(163, 4, 'IV', 'major', NULL, NULL);

-- 164. IV - I - V - vi (서브도미넌트 스타트 멜로딕 록/인디 팝)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (164, 'IV - I - V - vi (서브도미넌트 스타트 멜로딕 록/인디 팝)', '하쿠, 험브레더스 등 현대 J-Band에서 청량하고 가슴 벅찬 감정선을 이끌어내는 대표적인 4-1-5-6 루프', 94, 91, 'subdominant_start', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 164;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (164, 'Chorus'), (164, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 164;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(164, 1, 'IV', 'major', NULL, NULL),
(164, 2, 'I', 'major', NULL, NULL),
(164, 3, 'V', 'major', NULL, NULL),
(164, 4, 'vi', 'minor', NULL, NULL);

-- 165. vi - IV - I - V (청춘 질주 펑크 록 / 험브레더스 스타일)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (165, 'vi - IV - I - V (청춘 질주 펑크 록 / 험브레더스 스타일)', '험브레더스 특유의 3피스 기타 리프와 직선적인 스트레이트 드럼 비트에 최적화된 마이너 파워팝/펑크 진행', 93, 90, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 165;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (165, 'Chorus'), (165, 'Intro'), (165, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 165;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(165, 1, 'vi', 'minor', NULL, NULL),
(165, 2, 'IV', 'major', NULL, NULL),
(165, 3, 'I', 'major', NULL, NULL),
(165, 4, 'V', 'major', NULL, NULL);

-- 166. IV - V - iii - IV (하쿠 몽환적 루프 / 4도 미해소 순환)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (166, 'IV - V - iii - IV (하쿠 몽환적 루프 / 4도 미해소 순환)', '6도로 해결하지 않고 4도로 다시 되돌아가며 공중에 붕 뜬 듯한 아련함과 공간감을 연출하는 감성 인디 록 루프', 87, 89, 'jrock_anthem', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 166;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (166, 'Verse'), (166, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 166;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(166, 1, 'IV', 'major', NULL, NULL),
(166, 2, 'V', 'major', NULL, NULL),
(166, 3, 'iii', 'minor', NULL, NULL),
(166, 4, 'IV', 'major', NULL, NULL);

-- 167. ii - IV - I - V (J-밴드 인디 팝 서정 도입부)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (167, 'ii - IV - I - V (J-밴드 인디 팝 서정 도입부)', '2도 마이너에서 4도로 부드럽게 상승한 뒤 1-5로 안착하는 백넘버 계열의 서정적 어쿠스틱/인디록 벌스 진행', 88, 92, 'diatonic_pop', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 167;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (167, 'Verse'), (167, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 167;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(167, 1, 'ii', 'minor', NULL, NULL),
(167, 2, 'IV', 'major', NULL, NULL),
(167, 3, 'I', 'major', NULL, NULL),
(167, 4, 'V', 'major', NULL, NULL);

-- 168. IV - V - vi - V (질주감 넘치는 프리코러스 5도 킥)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (168, 'IV - V - vi - V (질주감 넘치는 프리코러스 5도 킥)', '후렴구 진입 직전 6도까지 벅차오르게 상승한 뒤 5도 도미넌트로 시원하게 열어주며 에너지를 폭발시키는 빌드업', 91, 94, 'stepwise_ascent', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 168;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (168, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 168;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(168, 1, 'IV', 'major', NULL, NULL),
(168, 2, 'V', 'major', NULL, NULL),
(168, 3, 'vi', 'minor', NULL, NULL),
(168, 4, 'V', 'major', NULL, NULL);

-- 169. IV - V - iii - vi (K-Pop 걸그룹 청량 후렴의 황금 공식)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (169, 'IV - V - iii - vi (K-Pop 걸그룹 청량 후렴의 황금 공식)', '트와이스, 여자친구, 아이즈원 등 3~4세대 K-Pop 청량/벅차오름의 정수를 보여주는 대표적인 황금 진행', 98, 95, 'royal_road', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 169;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (169, 'Chorus'), (169, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 169;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(169, 1, 'IV', 'major', NULL, NULL),
(169, 2, 'V', 'major', NULL, NULL),
(169, 3, 'iii', 'minor', NULL, NULL),
(169, 4, 'vi', 'minor', NULL, NULL);

-- 170. vi - IV - I - V (틴크러시 / 걸크러시 마이너 댄스 팝)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (170, 'vi - IV - I - V (틴크러시 / 걸크러시 마이너 댄스 팝)', '블랙핑크, 르세라핌, 아이브, ITZY 등 강렬한 비트와 세련된 카리스마를 뿜어내는 모던 K-Pop 댄스곡 시그니처', 97, 93, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 170;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (170, 'Chorus'), (170, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 170;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(170, 1, 'vi', 'minor', NULL, NULL),
(170, 2, 'IV', 'major', NULL, NULL),
(170, 3, 'I', 'major', NULL, NULL),
(170, 4, 'V', 'major', NULL, NULL);

-- 171. IV - I - V - vi (이지리스닝 뉴 K-Pop / 감성 R&B 팝)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (171, 'IV - I - V - vi (이지리스닝 뉴 K-Pop / 감성 R&B 팝)', '뉴진스, 세븐틴, 투모로우바이투게더 등 편안하면서도 중독적인 Y2K/이지리스닝 감성의 중심 진행', 95, 92, 'subdominant_start', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 171;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (171, 'Chorus'), (171, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 171;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(171, 1, 'IV', 'major', NULL, NULL),
(171, 2, 'I', 'major', NULL, NULL),
(171, 3, 'V', 'major', NULL, NULL),
(171, 4, 'vi', 'minor', NULL, NULL);

-- 172. ii - V - I - IV (K-Pop 댄스곡 그루비 프리코러스 / 5도 하강)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (172, 'ii - V - I - IV (K-Pop 댄스곡 그루비 프리코러스 / 5도 하강)', '레드벨벳, NCT, 샤이니 등 세련된 K-Pop 프리코러스에서 텐션을 차곡차곡 쌓아올리는 재즈 팝 턴어라운드', 90, 95, 'circle_of_fifths', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 172;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (172, 'Pre-Chorus'), (172, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 172;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(172, 1, 'ii', 'minor', NULL, NULL),
(172, 2, 'V', 'dominant', '7', NULL),
(172, 3, 'I', 'major', NULL, NULL),
(172, 4, 'IV', 'major', NULL, NULL);

-- 173. bVI - bVII - I - I (에픽 K-Pop 모달 브릿지 / 마리오 카덴스)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (173, 'bVI - bVII - I - I (에픽 K-Pop 모달 브릿지 / 마리오 카덴스)', '에스파, 스트레이키즈, 엔믹스 등 곡의 전환점에서 웅장하고 미래지향적인 충격을 선사하는 모달 인터체인지 진행', 89, 86, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 173;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (173, 'Bridge'), (173, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 173;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(173, 1, 'bVI', 'major', NULL, NULL),
(173, 2, 'bVII', 'major', NULL, NULL),
(173, 3, 'I', 'major', NULL, NULL),
(173, 4, 'I', 'major', NULL, NULL);

-- 174. IV - iv - I - I (K-Pop 감성 보컬/발라드 서브도미넌트 마이너)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (174, 'IV - iv - I - I (K-Pop 감성 보컬/발라드 서브도미넌트 마이너)', '아이유, 태연 등의 보컬곡 후렴구 끝이나 브릿지에서 깊은 여운과 애절함을 남기는 iv 차용화음 카덴스', 92, 90, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 174;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (174, 'Bridge'), (174, 'Outro'), (174, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 174;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(174, 1, 'IV', 'major', NULL, NULL),
(174, 2, 'IV', 'minor', NULL, NULL),
(174, 3, 'I', 'major', NULL, NULL),
(174, 4, 'I', 'major', NULL, NULL);

-- 175. vi - V - IV - III7 (K-Pop 댄스 오모테 긴장 래핑/프리코러스)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (175, 'vi - V - IV - III7 (K-Pop 댄스 오모테 긴장 래핑/프리코러스)', '방탄소년단, 스트레이키즈 등의 격정적인 랩 파트 및 후렴 직전 폭풍전야 긴장감 형성 시그니처 진행', 91, 93, 'secondary_dominant', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 175;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (175, 'Pre-Chorus'), (175, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 175;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(175, 1, 'vi', 'minor', NULL, NULL),
(175, 2, 'V', 'major', NULL, NULL),
(175, 3, 'IV', 'major', NULL, NULL),
(175, 4, 'III', 'dominant', '7', NULL);

-- 176. I - III7 - vi - IV (K-Pop 레트로 팝 / 아이유·레드벨벳 빈티지)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (176, 'I - III7 - vi - IV (K-Pop 레트로 팝 / 아이유·레드벨벳 빈티지)', '아이유(좋은 날, 분홍신), 레드벨벳 등 세련된 빈티지 스윙/재즈 팝 느낌을 주는 3도 세컨더리 도미넌트 도약', 88, 91, 'secondary_dominant', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 176;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (176, 'Verse'), (176, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 176;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(176, 1, 'I', 'major', NULL, NULL),
(176, 2, 'III', 'dominant', '7', NULL),
(176, 3, 'vi', 'minor', NULL, NULL),
(176, 4, 'IV', 'major', NULL, NULL);

-- 177. IV - III7 - vi - I (보컬로이드 황금률 마루사 진행 / Just the Two of Us)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (177, 'IV - III7 - vi - I (보컬로이드 황금률 마루사 진행 / Just the Two of Us)', '요아소비(Ayase), DECO*27 등 보컬로이드/우타이테 씬에서 가장 사랑받는 펑키하고 세련된 쾌속 루프', 98, 96, 'vocaloid_speed', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 177;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (177, 'Chorus'), (177, 'Intro'), (177, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 177;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(177, 1, 'IV', 'major', NULL, NULL),
(177, 2, 'III', 'dominant', '7', NULL),
(177, 3, 'vi', 'minor', NULL, NULL),
(177, 4, 'I', 'major', NULL, NULL);

-- 178. vi - V - IV - III7 (보컬로이드 질주곡의 상징 오모테 진행)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (178, 'vi - V - IV - III7 (보컬로이드 질주곡의 상징 오모테 진행)', 'Neru, wowaka 등 어둡고 질주하는 초고속 BPM 보컬로이드 록의 시그니처 비장미 진행', 96, 94, 'vocaloid_speed', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 178;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (178, 'Chorus'), (178, 'Pre-Chorus'), (178, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 178;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(178, 1, 'vi', 'minor', NULL, NULL),
(178, 2, 'V', 'major', NULL, NULL),
(178, 3, 'IV', 'major', NULL, NULL),
(178, 4, 'III', 'dominant', '7', NULL);

-- 179. IV - V - vi - vi (고속 J-Pop/우타이테 6도 록 질주 진행)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (179, 'IV - V - vi - vi (고속 J-Pop/우타이테 6도 록 질주 진행)', '카게로우 프로젝트(Jin), Eve 등에서 후렴구 멜로디가 쉼 없이 내달릴 때 바탕을 지탱하는 파워풀한 록 루프', 93, 92, 'vocaloid_speed', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 179;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (179, 'Chorus'), (179, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 179;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(179, 1, 'IV', 'major', NULL, NULL),
(179, 2, 'V', 'major', NULL, NULL),
(179, 3, 'vi', 'minor', NULL, NULL),
(179, 4, 'vi', 'minor', NULL, NULL);

-- 180. IV - V - I - bVII (보컬로이드 서프라이즈 믹솔리디안 턴)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (180, 'IV - V - I - bVII (보컬로이드 서프라이즈 믹솔리디안 턴)', '1도로 시원하게 해결한 직후 bVII로 깜짝 전조감을 주며 다음 마디 4도로의 자연스러운 연결을 만드는 천재적 턴어라운드', 89, 91, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 180;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (180, 'Chorus'), (180, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 180;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(180, 1, 'IV', 'major', NULL, NULL),
(180, 2, 'V', 'major', NULL, NULL),
(180, 3, 'I', 'major', NULL, NULL),
(180, 4, 'bVII', 'major', NULL, NULL);

-- 181. bVI - bVII - vi - I (모달 크로매틱 질주 우타이테 리프)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (181, 'bVI - bVII - vi - I (모달 크로매틱 질주 우타이테 리프)', '카미야마 요우, 메가테라 제로 등 감성 우타이테 록에서 단조의 어둠과 장조의 화려함을 교차시키는 역동적 진행', 90, 88, 'vocaloid_speed', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 181;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (181, 'Intro'), (181, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 181;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(181, 1, 'bVI', 'major', NULL, NULL),
(181, 2, 'bVII', 'major', NULL, NULL),
(181, 3, 'vi', 'minor', NULL, NULL),
(181, 4, 'I', 'major', NULL, NULL);

-- 182. IV - iv - iii - VI7 (멜로딕 보컬로이드 발라드 환상 진행)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (182, 'IV - iv - iii - VI7 (멜로딕 보컬로이드 발라드 환상 진행)', '4도 마이너(iv)의 눈물겨운 차용과 VI7 세컨더리 도미넌트가 결합하여 애니메이션 OST 피날레 같은 벅찬 감동을 주는 진행', 88, 89, 'secondary_dominant', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 182;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (182, 'Bridge'), (182, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 182;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(182, 1, 'IV', 'major', NULL, NULL),
(182, 2, 'IV', 'minor', NULL, NULL),
(182, 3, 'iii', 'minor', NULL, NULL),
(182, 4, 'VI', 'dominant', '7', NULL);

-- 183. vi - IV - V - I (마이너 스타트 쾌속 메이저 해방 카덴스)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (183, 'vi - IV - V - I (마이너 스타트 쾌속 메이저 해방 카덴스)', '어둡게 시작하여 5도 도미넌트를 거쳐 1도로 환하게 해방되는 쾌속 BPM 보컬로이드 후렴 전반부 진행', 92, 95, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 183;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (183, 'Chorus'), (183, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 183;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(183, 1, 'vi', 'minor', NULL, NULL),
(183, 2, 'IV', 'major', NULL, NULL),
(183, 3, 'V', 'major', NULL, NULL),
(183, 4, 'I', 'major', NULL, NULL);

-- 184. bVI - bVII - V - vi (우타이테 사비 종결 마이너 카덴스)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (184, 'bVI - bVII - V - vi (우타이테 사비 종결 마이너 카덴스)', '마리오 카덴스 상행 후 V-vi로 격정적인 마이너 종지를 맺으며 짙은 여운을 남기는 보컬로이드 클라이맥스 진행', 89, 91, 'modal_interchange', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 184;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (184, 'Chorus'), (184, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 184;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(184, 1, 'bVI', 'major', NULL, NULL),
(184, 2, 'bVII', 'major', NULL, NULL),
(184, 3, 'V', 'major', NULL, NULL),
(184, 4, 'vi', 'minor', NULL, NULL);

-- 185. I - V - vi - IV (그린데이 불멸의 팝 펑크 앤섬)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (185, 'I - V - vi - IV (그린데이 불멸의 팝 펑크 앤섬)', 'Green Day(Basket Case, When I Come Around) 등 전 세계 팝 펑크 밴드를 지배한 3화음 파워코드의 왕', 98, 95, 'pop_punk', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 185;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (185, 'Chorus'), (185, 'Verse'), (185, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 185;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(185, 1, 'I', 'major', NULL, NULL),
(185, 2, 'V', 'major', NULL, NULL),
(185, 3, 'vi', 'minor', NULL, NULL),
(185, 4, 'IV', 'major', NULL, NULL);

-- 186. I - V - IV - IV (그린데이 스트레이트 펑크 록 앤서)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (186, 'I - V - IV - IV (그린데이 스트레이트 펑크 록 앤서)', '단순하지만 4도에 2마디 머무르며 드라이브감과 시원한 록킹 사운드를 극대화하는 클래식 펑크 앤섬 진행', 92, 91, 'pop_punk', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 186;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (186, 'Chorus'), (186, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 186;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(186, 1, 'I', 'major', NULL, NULL),
(186, 2, 'V', 'major', NULL, NULL),
(186, 3, 'IV', 'major', NULL, NULL),
(186, 4, 'IV', 'major', NULL, NULL);

-- 187. vi - IV - I - V (그린데이 21 Guns 식 록 발라드)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (187, 'vi - IV - I - V (그린데이 21 Guns 식 록 발라드)', 'Green Day(21 Guns, Boulevard of Broken Dreams) 등 비장하고 쓸쓸한 멜로딕 록 발라드의 대명사', 95, 92, 'pop_punk', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 187;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (187, 'Verse'), (187, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 187;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(187, 1, 'vi', 'minor', NULL, NULL),
(187, 2, 'IV', 'major', NULL, NULL),
(187, 3, 'I', 'major', NULL, NULL),
(187, 4, 'V', 'major', NULL, NULL);

-- 188. IV - I - V - I (오아시스/펑크 완전 종지 앤서 카덴스)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (188, 'IV - I - V - I (오아시스/펑크 완전 종지 앤서 카덴스)', '오아시스나 팝 펑크 후렴의 마지막 4마디를 확실하게 종지 짓는 호쾌한 4-1-5-1 카덴스 진행', 91, 96, 'cadence_resolution', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 188;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (188, 'Chorus'), (188, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 188;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(188, 1, 'IV', 'major', NULL, NULL),
(188, 2, 'I', 'major', NULL, NULL),
(188, 3, 'V', 'major', NULL, NULL),
(188, 4, 'I', 'major', NULL, NULL);

-- 189. I - bVII - IV - I (오아시스 믹솔리디안 브릿팝 앤섬)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (189, 'I - bVII - IV - I (오아시스 믹솔리디안 브릿팝 앤섬)', 'Oasis(Live Forever, Morning Glory, Wonderwall 프리코러스) 등 90년대 브릿팝의 황금기를 상징하는 상쾌한 bVII 록 사운드', 94, 90, 'britpop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 189;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (189, 'Verse'), (189, 'Chorus'), (189, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 189;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(189, 1, 'I', 'major', NULL, NULL),
(189, 2, 'bVII', 'major', NULL, NULL),
(189, 3, 'IV', 'major', NULL, NULL),
(189, 4, 'I', 'major', NULL, NULL);

-- 190. I - V - vi - iii (오아시스 Don''t Look Back in Anger 캐논 앤섬)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (190, 'I - V - vi - iii (오아시스 Don''t Look Back in Anger 캐논 앤섬)', '전 세계 수백만 명이 떼창하는 Don''t Look Back in Anger 후렴의 서정적인 파헬벨 캐논형 브릿팝 진행', 96, 94, 'britpop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 190;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (190, 'Chorus'), (190, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 190;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(190, 1, 'I', 'major', NULL, NULL),
(190, 2, 'V', 'major', NULL, NULL),
(190, 3, 'vi', 'minor', NULL, NULL),
(190, 4, 'iii', 'minor', NULL, NULL);

-- 191. IV - V - I - vi (오아시스 Stand By Me 식 팝 록 앤서)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (191, 'IV - V - I - vi (오아시스 Stand By Me 식 팝 록 앤서)', '오아시스, 비틀즈 스타일의 클래식한 브릿팝 멜로디 라인을 살려주는 따뜻하고 대중적인 진행', 92, 93, 'britpop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 191;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (191, 'Chorus'), (191, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 191;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(191, 1, 'IV', 'major', NULL, NULL),
(191, 2, 'V', 'major', NULL, NULL),
(191, 3, 'I', 'major', NULL, NULL),
(191, 4, 'vi', 'minor', NULL, NULL);

-- 192. ii - IV - I - V (오아시스 몽환적 어쿠스틱 그루브)
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (192, 'ii - IV - I - V (오아시스 몽환적 어쿠스틱 그루브)', 'Oasis(Champagne Supernova), Radiohead 초기 등 나른하고 사이키델릭한 브릿팝 벌스의 대표적 2도 마이너 출발 진행', 89, 91, 'britpop', 8, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 192;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (192, 'Verse'), (192, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 192;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(192, 1, 'ii', 'minor', NULL, NULL),
(192, 2, 'IV', 'major', NULL, NULL),
(192, 3, 'I', 'major', NULL, NULL),
(192, 4, 'V', 'major', NULL, NULL);
