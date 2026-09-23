-- ==============================================================================
-- Chord Progression Manager - 도미넌트(5도) 시작 추천 코드 진행 시드 데이터 (배치 7: ID 193~304)
-- 각 7개 송폼(Intro, Verse, Pre-Chorus, Chorus, Interlude, Bridge, Outro)별 16개씩 총 112선 완비
-- 대상 테이블: system_recommendation_progressions, system_progression_form_tags, system_progression_steps
-- ==============================================================================

-- 193. V - IV - I - I (블루스/록 인트로 역진행) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (193, 'V - IV - I - I (블루스/록 인트로 역진행)', '도미넌트 5도에서 출발해 4-1로 해결되며 강렬한 록 사운드를 여는 클래식 인트로', 91, 92, 'cadence_resolution', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 193;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (193, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 193;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(193, 1, 'V', 'major', NULL, NULL),
(193, 2, 'IV', 'major', NULL, NULL),
(193, 3, 'I', 'major', NULL, NULL),
(193, 4, 'I', 'major', NULL, NULL);

-- 194. V - IV - vi - V (록/팝 긴장 유지 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (194, 'V - IV - vi - V (록/팝 긴장 유지 인트로)', '1도로 해결하지 않고 6도와 5도를 맴돌며 보컬 진입 전 기대감을 극대화하는 인트로 루프', 91, 95, 'jrock_anthem', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 194;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (194, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 194;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(194, 1, 'V', 'major', NULL, NULL),
(194, 2, 'IV', 'major', NULL, NULL),
(194, 3, 'vi', 'minor', NULL, NULL),
(194, 4, 'V', 'major', NULL, NULL);

-- 195. V - vi - IV - I (5도 출발 팝 4코드 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (195, 'V - vi - IV - I (5도 출발 팝 4코드 인트로)', '친숙한 팝 4코드를 5도부터 시작하여 색다른 추진력과 신선함을 부여하는 밴드 인트로', 92, 90, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 195;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (195, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 195;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(195, 1, 'V', 'major', NULL, NULL),
(195, 2, 'vi', 'minor', NULL, NULL),
(195, 3, 'IV', 'major', NULL, NULL),
(195, 4, 'I', 'major', NULL, NULL);

-- 196. V - I - IV - V (5-1 턴어라운드 테마 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (196, 'V - I - IV - V (5-1 턴어라운드 테마 인트로)', '5-1로 빠르게 안착한 후 4-5로 다시 열어두어 곡의 메인 테마를 소개하는 인트로', 97, 96, 'standard_turnaround', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 196;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (196, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 196;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(196, 1, 'V', 'major', NULL, NULL),
(196, 2, 'I', 'major', NULL, NULL),
(196, 3, 'IV', 'major', NULL, NULL),
(196, 4, 'V', 'major', NULL, NULL);

-- 197. V - vi - iii - IV (5도 출발 서정적 인트로 루프) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (197, 'V - vi - iii - IV (5도 출발 서정적 인트로 루프)', '도미넌트의 긴장에서 6-3-4로 부드럽게 감싸안으며 서정적인 멜로디를 돋보이게 하는 인트로', 96, 93, 'royal_road', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 197;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (197, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 197;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(197, 1, 'V', 'major', NULL, NULL),
(197, 2, 'vi', 'minor', NULL, NULL),
(197, 3, 'iii', 'minor', NULL, NULL),
(197, 4, 'IV', 'major', NULL, NULL);

-- 198. V - IV - iii - ii (도미넌트 순차 하강 감성 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (198, 'V - IV - iii - ii (도미넌트 순차 하강 감성 인트로)', '5도에서 2도까지 차분하게 베이스와 화음이 하강하며 아련한 정서를 형성하는 어쿠스틱 인트로', 97, 92, 'descending_line', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 198;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (198, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 198;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(198, 1, 'V', 'major', NULL, NULL),
(198, 2, 'IV', 'major', NULL, NULL),
(198, 3, 'iii', 'minor', NULL, NULL),
(198, 4, 'ii', 'minor', NULL, NULL);

-- 199. V - I - vi - IV (5-1 해결 후 둘룹 순환 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (199, 'V - I - vi - IV (5-1 해결 후 둘룹 순환 인트로)', '도미넌트 해결 후 6-4로 이어지며 50년대 팝의 따뜻함을 현대적으로 재해석한 인트로', 97, 96, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 199;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (199, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 199;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(199, 1, 'V', 'major', NULL, NULL),
(199, 2, 'I', 'major', NULL, NULL),
(199, 3, 'vi', 'minor', NULL, NULL),
(199, 4, 'IV', 'major', NULL, NULL);

-- 200. V - bVII - IV - I (5도 출발 믹솔리디안 록 인트로 리프) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (200, 'V - bVII - IV - I (5도 출발 믹솔리디안 록 인트로 리프)', 'bVII 플랫세븐스를 경유하여 록앤롤 특유의 거칠고 시원한 개방감을 터뜨리는 인트로', 92, 92, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 200;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (200, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 200;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(200, 1, 'V', 'major', NULL, NULL),
(200, 2, 'bVII', 'major', NULL, NULL),
(200, 3, 'IV', 'major', NULL, NULL),
(200, 4, 'I', 'major', NULL, NULL);

-- 201. V - IV - I - V (완전 순환 도미넌트 뱀프 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (201, 'V - IV - I - V (완전 순환 도미넌트 뱀프 인트로)', '5도에서 4-1을 거쳐 다시 5도로 돌아오며 페스티벌 록의 열기를 지피는 스트레이트 인트로', 90, 95, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 201;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (201, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 201;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(201, 1, 'V', 'major', NULL, NULL),
(201, 2, 'IV', 'major', NULL, NULL),
(201, 3, 'I', 'major', NULL, NULL),
(201, 4, 'V', 'major', NULL, NULL);

-- 202. V - vi - I - IV (5도 도약 청량 밴드 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (202, 'V - vi - I - IV (5도 도약 청량 밴드 인트로)', '5도에서 6도로 벅차오른 뒤 1-4로 넓은 공간감을 펼치는 현대 J-Rock/K-Pop 인트로', 96, 94, 'subdominant_start', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 202;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (202, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 202;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(202, 1, 'V', 'major', NULL, NULL),
(202, 2, 'vi', 'minor', NULL, NULL),
(202, 3, 'I', 'major', NULL, NULL),
(202, 4, 'IV', 'major', NULL, NULL);

-- 203. V - iii - vi - IV (5-3-6-4 감성 발라드 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (203, 'V - iii - vi - IV (5-3-6-4 감성 발라드 인트로)', '부드러운 3도 마이너를 거쳐 6-4로 유려하게 흘러가는 피아노 발라드/R&B 인트로', 93, 95, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 203;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (203, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 203;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(203, 1, 'V', 'major', NULL, NULL),
(203, 2, 'iii', 'minor', NULL, NULL),
(203, 3, 'vi', 'minor', NULL, NULL),
(203, 4, 'IV', 'major', NULL, NULL);

-- 204. V - vi - V - I (지속 긴장 후 1도 완결 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (204, 'V - vi - V - I (지속 긴장 후 1도 완결 인트로)', '도미넌트와 6도의 줄다리기 끝에 1도로 깔끔하게 완결되며 벌스로 넘어가는 인트로', 96, 96, 'cadence_resolution', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 204;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (204, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 204;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(204, 1, 'V', 'major', NULL, NULL),
(204, 2, 'vi', 'minor', NULL, NULL),
(204, 3, 'V', 'major', NULL, NULL),
(204, 4, 'I', 'major', NULL, NULL);

-- 205. V - ii - IV - I (5-2-4-1 인디 록 서정 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (205, 'V - ii - IV - I (5-2-4-1 인디 록 서정 인트로)', '5도에서 2도 마이너로 낙차를 준 뒤 4-1로 차분하게 안착하는 얼터너티브 록 인트로', 96, 96, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 205;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (205, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 205;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(205, 1, 'V', 'major', NULL, NULL),
(205, 2, 'ii', 'minor', NULL, NULL),
(205, 3, 'IV', 'major', NULL, NULL),
(205, 4, 'I', 'major', NULL, NULL);

-- 206. V - bVI - bVII - I (5도 출발 마리오 카덴스 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (206, 'V - bVI - bVII - I (5도 출발 마리오 카덴스 인트로)', '5도에서 bVI-bVII 모달 인터체인지로 급반전하여 1도로 장엄하게 터지는 에픽 인트로', 93, 89, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 206;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (206, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 206;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(206, 1, 'V', 'major', NULL, NULL),
(206, 2, 'bVI', 'major', NULL, NULL),
(206, 3, 'bVII', 'major', NULL, NULL),
(206, 4, 'I', 'major', NULL, NULL);

-- 207. V - IV - I - IV (5도 임팩트 2코드 그루브 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (207, 'V - IV - I - IV (5도 임팩트 2코드 그루브 인트로)', '첫 마디 5도 임팩트 후 4도와 1도의 찰진 펑키 리듬을 얹어 그루브를 타는 인트로', 91, 92, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 207;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (207, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 207;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(207, 1, 'V', 'major', NULL, NULL),
(207, 2, 'IV', 'major', NULL, NULL),
(207, 3, 'I', 'major', NULL, NULL),
(207, 4, 'IV', 'major', NULL, NULL);

-- 208. V - vi - IV - vi (감성 모던 록 긴장 루프 인트로) [Intro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (208, 'V - vi - IV - vi (감성 모던 록 긴장 루프 인트로)', '5도 출발 후 6도와 4도를 교차하며 몽환적이고 질주하는 기타 아르페지오 인트로', 94, 91, 'jrock_anthem', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 208;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (208, 'Intro');
DELETE FROM system_progression_steps WHERE progression_id = 208;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(208, 1, 'V', 'major', NULL, NULL),
(208, 2, 'vi', 'minor', NULL, NULL),
(208, 3, 'IV', 'major', NULL, NULL),
(208, 4, 'vi', 'minor', NULL, NULL);

-- 209. V - vi - IV - I (5도 출발 벌스 팝 4코드 순환) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (209, 'V - vi - IV - I (5도 출발 벌스 팝 4코드 순환)', '도미넌트의 긴장감으로 이야기를 시작하여 6-4-1로 자연스럽게 안착하는 팝 벌스 진행', 94, 89, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 209;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (209, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 209;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(209, 1, 'V', 'major', NULL, NULL),
(209, 2, 'vi', 'minor', NULL, NULL),
(209, 3, 'IV', 'major', NULL, NULL),
(209, 4, 'I', 'major', NULL, NULL);

-- 210. V - IV - I - vi (도미넌트 스타트 팝 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (210, 'V - IV - I - vi (도미넌트 스타트 팝 벌스)', '5도에서 4-1로 하강한 뒤 6도 마이너로 여운을 주며 이야기를 이어가는 서정 벌스', 97, 94, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 210;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (210, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 210;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(210, 1, 'V', 'major', NULL, NULL),
(210, 2, 'IV', 'major', NULL, NULL),
(210, 3, 'I', 'major', NULL, NULL),
(210, 4, 'vi', 'minor', NULL, NULL);

-- 211. V - vi - iii - IV (담담한 멜로디 전개 감성 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (211, 'V - vi - iii - IV (담담한 멜로디 전개 감성 벌스)', '5-6-3-4의 부드러운 스텝 연결로 보컬의 음색과 가사 전달력을 극대화하는 벌스', 95, 89, 'royal_road', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 211;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (211, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 211;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(211, 1, 'V', 'major', NULL, NULL),
(211, 2, 'vi', 'minor', NULL, NULL),
(211, 3, 'iii', 'minor', NULL, NULL),
(211, 4, 'IV', 'major', NULL, NULL);

-- 212. V - I - vi - V (5-1 안착 후 5도 오픈 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (212, 'V - I - vi - V (5-1 안착 후 5도 오픈 벌스)', '5-1로 안정감을 준 뒤 6-5로 부드럽게 열어 다음 소절을 유도하는 클래식 벌스', 92, 90, 'standard_turnaround', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 212;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (212, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 212;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(212, 1, 'V', 'major', NULL, NULL),
(212, 2, 'I', 'major', NULL, NULL),
(212, 3, 'vi', 'minor', NULL, NULL),
(212, 4, 'V', 'major', NULL, NULL);

-- 213. V - IV - I - V (포크/컨트리 5도 순환 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (213, 'V - IV - I - V (포크/컨트리 5도 순환 벌스)', '5도에서 4-1로 갔다가 다시 5도로 돌아오는 경쾌하고 어쿠스틱한 스트로크 벌스', 96, 94, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 213;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (213, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 213;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(213, 1, 'V', 'major', NULL, NULL),
(213, 2, 'IV', 'major', NULL, NULL),
(213, 3, 'I', 'major', NULL, NULL),
(213, 4, 'V', 'major', NULL, NULL);

-- 214. V - vi - ii - V (2-5 턴어라운드 재즈 팝 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (214, 'V - vi - ii - V (2-5 턴어라운드 재즈 팝 벌스)', '5도에서 6도 경유 후 2-5로 매끄럽게 연결되는 세련된 어번/R&B 스타일 벌스', 96, 94, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 214;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (214, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 214;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(214, 1, 'V', 'major', NULL, NULL),
(214, 2, 'vi', 'minor', NULL, NULL),
(214, 3, 'ii', 'minor', NULL, NULL),
(214, 4, 'V', 'major', NULL, NULL);

-- 215. V - iii - IV - I (절제된 감정선의 잔잔한 발라드 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (215, 'V - iii - IV - I (절제된 감정선의 잔잔한 발라드 벌스)', '5도에서 3도 마이너로 차분하게 낙하하여 4-1로 이어지는 서정적인 발라드 벌스', 92, 93, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 215;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (215, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 215;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(215, 1, 'V', 'major', NULL, NULL),
(215, 2, 'iii', 'minor', NULL, NULL),
(215, 3, 'IV', 'major', NULL, NULL),
(215, 4, 'I', 'major', NULL, NULL);

-- 216. V - IV - iii - vi (5도 출발 스텝 하강 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (216, 'V - IV - iii - vi (5도 출발 스텝 하강 벌스)', '5-4-3 순차 하강 후 6도 마이너로 감싸며 애틋한 서사를 완성하는 J-Pop/K-Pop 벌스', 96, 92, 'descending_line', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 216;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (216, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 216;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(216, 1, 'V', 'major', NULL, NULL),
(216, 2, 'IV', 'major', NULL, NULL),
(216, 3, 'iii', 'minor', NULL, NULL),
(216, 4, 'vi', 'minor', NULL, NULL);

-- 217. V - vi - IV - V (긴장감 유지 팝/록 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (217, 'V - vi - IV - V (긴장감 유지 팝/록 벌스)', '5도로 시작해 5도로 끝나며 벌스 내내 팽팽한 리듬감과 긴장감을 유지하는 모던 록 벌스', 93, 91, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 217;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (217, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 217;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(217, 1, 'V', 'major', NULL, NULL),
(217, 2, 'vi', 'minor', NULL, NULL),
(217, 3, 'IV', 'major', NULL, NULL),
(217, 4, 'V', 'major', NULL, NULL);

-- 218. V - I - IV - I (소박하고 따뜻한 어쿠스틱 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (218, 'V - I - IV - I (소박하고 따뜻한 어쿠스틱 벌스)', '5-1의 명쾌함과 4-1의 편안한 안도감이 교차하는 따뜻한 싱어송라이터 벌스', 93, 96, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 218;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (218, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 218;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(218, 1, 'V', 'major', NULL, NULL),
(218, 2, 'I', 'major', NULL, NULL),
(218, 3, 'IV', 'major', NULL, NULL),
(218, 4, 'I', 'major', NULL, NULL);

-- 219. V - ii - IV - V (5-2-4-5 감성 인디 팝 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (219, 'V - ii - IV - V (5-2-4-5 감성 인디 팝 벌스)', '2도에서 4-5로 상승하는 추진력으로 벌스 후반부의 고조감을 준비하는 진행', 90, 91, 'stepwise_ascent', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 219;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (219, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 219;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(219, 1, 'V', 'major', NULL, NULL),
(219, 2, 'ii', 'minor', NULL, NULL),
(219, 3, 'IV', 'major', NULL, NULL),
(219, 4, 'V', 'major', NULL, NULL);

-- 220. V - IV - I - IV (5도 출발 그루비 팝 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (220, 'V - IV - I - IV (5도 출발 그루비 팝 벌스)', '5도 임팩트 후 4-1-4 루프로 멜로디에 리듬감을 불어넣는 댄서블 벌스', 90, 92, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 220;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (220, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 220;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(220, 1, 'V', 'major', NULL, NULL),
(220, 2, 'IV', 'major', NULL, NULL),
(220, 3, 'I', 'major', NULL, NULL),
(220, 4, 'IV', 'major', NULL, NULL);

-- 221. V - vi - I - V (아르페지오 기타 최적화 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (221, 'V - vi - I - V (아르페지오 기타 최적화 벌스)', '잔잔한 핑거피킹 기타에 어울리는 서정적이고 맑은 5도 출발 순환 벌스', 92, 92, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 221;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (221, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 221;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(221, 1, 'V', 'major', NULL, NULL),
(221, 2, 'vi', 'minor', NULL, NULL),
(221, 3, 'I', 'major', NULL, NULL),
(221, 4, 'V', 'major', NULL, NULL);

-- 222. V - iii - vi - ii (5도권 하강 순환 재지 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (222, 'V - iii - vi - ii (5도권 하강 순환 재지 벌스)', '5-3-6-2로 이어지며 풍성한 재즈 팝 화성감을 연출하는 고급스러운 벌스', 96, 94, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 222;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (222, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 222;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(222, 1, 'V', 'major', NULL, NULL),
(222, 2, 'iii', 'minor', NULL, NULL),
(222, 3, 'vi', 'minor', NULL, NULL),
(222, 4, 'ii', 'minor', NULL, NULL);

-- 223. V - bVII - IV - I (믹솔리디안 어반 록 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (223, 'V - bVII - IV - I (믹솔리디안 어반 록 벌스)', 'bVII 모달 인터체인지로 세련된 록 그루브를 뿜어내는 브릿팝/모던록 벌스', 90, 90, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 223;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (223, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 223;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(223, 1, 'V', 'major', NULL, NULL),
(223, 2, 'bVII', 'major', NULL, NULL),
(223, 3, 'IV', 'major', NULL, NULL),
(223, 4, 'I', 'major', NULL, NULL);

-- 224. V - I - ii - V (스탠다드 턴어라운드 벌스) [Verse]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (224, 'V - I - ii - V (스탠다드 턴어라운드 벌스)', '5-1 안착 후 2-5로 다시 턴을 돌며 안정적으로 이야기를 전개하는 스탠다드 벌스', 93, 90, 'standard_turnaround', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 224;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (224, 'Verse');
DELETE FROM system_progression_steps WHERE progression_id = 224;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(224, 1, 'V', 'major', NULL, NULL),
(224, 2, 'I', 'major', NULL, NULL),
(224, 3, 'ii', 'minor', NULL, NULL),
(224, 4, 'V', 'major', NULL, NULL);

-- 225. V - vi - IV - V (5도 샌드위치 긴장 고조 빌드업) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (225, 'V - vi - IV - V (5도 샌드위치 긴장 고조 빌드업)', '5도로 시작해 6-4를 거쳐 다시 5도로 마감하며 후렴 직전 에너지를 극대화하는 빌드업', 97, 91, 'tension_build', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 225;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (225, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 225;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(225, 1, 'V', 'major', NULL, NULL),
(225, 2, 'vi', 'minor', NULL, NULL),
(225, 3, 'IV', 'major', NULL, NULL),
(225, 4, 'V', 'major', NULL, NULL);

-- 226. V - IV - iii - ii (순차 하강 후 2도 오픈 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (226, 'V - IV - iii - ii (순차 하강 후 2도 오픈 프리코러스)', '5도에서 2도까지 순차적으로 내려앉으며 후렴의 강한 폭발을 대비하는 감성 빌드업', 94, 91, 'descending_line', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 226;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (226, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 226;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(226, 1, 'V', 'major', NULL, NULL),
(226, 2, 'IV', 'major', NULL, NULL),
(226, 3, 'iii', 'minor', NULL, NULL),
(226, 4, 'ii', 'minor', NULL, NULL);

-- 227. V - vi - bVI - bVII (모달 상행 돌파 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (227, 'V - vi - bVI - bVII (모달 상행 돌파 프리코러스)', '5-6도 진행 후 bVI-bVII 모달 카덴스로 단번에 후렴을 열어젖히는 쾌속 빌드업', 94, 89, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 227;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (227, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 227;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(227, 1, 'V', 'major', NULL, NULL),
(227, 2, 'vi', 'minor', NULL, NULL),
(227, 3, 'bVI', 'major', NULL, NULL),
(227, 4, 'bVII', 'major', NULL, NULL);

-- 228. V - IV - V - vi (도미넌트 밀당 후 6도 고조 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (228, 'V - IV - V - vi (도미넌트 밀당 후 6도 고조 프리코러스)', '5도와 4도의 교차 텐션 후 6도로 치솟으며 후렴 바로 앞에서 극적 낙차를 만드는 진행', 93, 96, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 228;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (228, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 228;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(228, 1, 'V', 'major', NULL, NULL),
(228, 2, 'IV', 'major', NULL, NULL),
(228, 3, 'V', 'major', NULL, NULL),
(228, 4, 'vi', 'minor', NULL, NULL);

-- 229. V - vi - ii - V (2-5 상승 극대화 K-Pop 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (229, 'V - vi - ii - V (2-5 상승 극대화 K-Pop 프리코러스)', '6도 경유 후 2-5로 긴장감을 팽팽하게 당겨 코러스 폭발력을 높이는 세련된 빌드업', 92, 92, 'circle_of_fifths', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 229;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (229, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 229;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(229, 1, 'V', 'major', NULL, NULL),
(229, 2, 'vi', 'minor', NULL, NULL),
(229, 3, 'ii', 'minor', NULL, NULL),
(229, 4, 'V', 'major', NULL, NULL);

-- 230. V - iii - IV - V (3도 경유 4-5 상승 왕도형 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (230, 'V - iii - IV - V (3도 경유 4-5 상승 왕도형 프리코러스)', '3도 마이너의 애절함을 거쳐 4-5로 당당하게 뻗어나가는 멜로딕 록 프리코러스', 93, 95, 'stepwise_ascent', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 230;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (230, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 230;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(230, 1, 'V', 'major', NULL, NULL),
(230, 2, 'iii', 'minor', NULL, NULL),
(230, 3, 'IV', 'major', NULL, NULL),
(230, 4, 'V', 'major', NULL, NULL);

-- 231. V - IV - I - V (파워 팝 스트레이트 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (231, 'V - IV - I - V (파워 팝 스트레이트 프리코러스)', '단순명쾌한 록 비트로 거침없이 후렴으로 질주하는 스트레이트 프리코러스', 92, 94, 'pop_punk', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 231;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (231, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 231;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(231, 1, 'V', 'major', NULL, NULL),
(231, 2, 'IV', 'major', NULL, NULL),
(231, 3, 'I', 'major', NULL, NULL),
(231, 4, 'V', 'major', NULL, NULL);

-- 232. V - vi - iii - IV (서정적 밴드 감성 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (232, 'V - vi - iii - IV (서정적 밴드 감성 프리코러스)', '후렴 직전 4도로 시원하게 공간을 열며 감정의 파도를 밀어올리는 J-Band 프리코러스', 94, 89, 'royal_road', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 232;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (232, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 232;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(232, 1, 'V', 'major', NULL, NULL),
(232, 2, 'vi', 'minor', NULL, NULL),
(232, 3, 'iii', 'minor', NULL, NULL),
(232, 4, 'IV', 'major', NULL, NULL);

-- 233. V - IV - IV - V (4도 체류 서스펜스 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (233, 'V - IV - IV - V (4도 체류 서스펜스 프리코러스)', '4도에 2마디 동안 머물며 숨을 고른 뒤 5도 킥으로 후렴을 폭발시키는 빌드업', 92, 89, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 233;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (233, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 233;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(233, 1, 'V', 'major', NULL, NULL),
(233, 2, 'IV', 'major', NULL, NULL),
(233, 3, 'IV', 'major', NULL, NULL),
(233, 4, 'V', 'major', NULL, NULL);

-- 234. V - bVI - bVII - V (모달 상행 후 도미넌트 오픈) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (234, 'V - bVI - bVII - V (모달 상행 후 도미넌트 오픈)', 'bVI-bVII로 힘차게 밀어올린 뒤 5도로 완벽하게 후렴의 문을 여는 드라마틱 프리코러스', 97, 91, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 234;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (234, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 234;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(234, 1, 'V', 'major', NULL, NULL),
(234, 2, 'bVI', 'major', NULL, NULL),
(234, 3, 'bVII', 'major', NULL, NULL),
(234, 4, 'V', 'major', NULL, NULL);

-- 235. V - vi - IV - iii (점진적 화성 발라드 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (235, 'V - vi - IV - iii (점진적 화성 발라드 프리코러스)', '화음의 흐름을 3도 마이너로 침잠시켜 후렴 첫 음의 파괴력을 배가시키는 발라드 빌드업', 94, 94, 'descending_line', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 235;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (235, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 235;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(235, 1, 'V', 'major', NULL, NULL),
(235, 2, 'vi', 'minor', NULL, NULL),
(235, 3, 'IV', 'major', NULL, NULL),
(235, 4, 'iii', 'minor', NULL, NULL);

-- 236. V - I - IV - V (안정과 긴장 교차 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (236, 'V - I - IV - V (안정과 긴장 교차 프리코러스)', '1도로 잠시 안도감을 주었다가 4-5로 상승하며 관객을 후렴으로 이끄는 프리코러스', 94, 90, 'stepwise_ascent', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 236;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (236, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 236;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(236, 1, 'V', 'major', NULL, NULL),
(236, 2, 'I', 'major', NULL, NULL),
(236, 3, 'IV', 'major', NULL, NULL),
(236, 4, 'V', 'major', NULL, NULL);

-- 237. V - IV - vi - V (질주 밴드 프리코러스 킥) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (237, 'V - IV - vi - V (질주 밴드 프리코러스 킥)', '백넘버, 험브레더스 식 드럼 빌드업과 결합하여 심장을 뛰게 만드는 록 프리코러스', 92, 96, 'jrock_anthem', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 237;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (237, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 237;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(237, 1, 'V', 'major', NULL, NULL),
(237, 2, 'IV', 'major', NULL, NULL),
(237, 3, 'vi', 'minor', NULL, NULL),
(237, 4, 'V', 'major', NULL, NULL);

-- 238. V - ii - iii - IV (2-3-4 상행 계단식 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (238, 'V - ii - iii - IV (2-3-4 상행 계단식 프리코러스)', '5도 후 2-3-4로 한 단계씩 차곡차곡 에너지를 적립하는 전형적인 계단식 빌드업', 93, 91, 'stepwise_ascent', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 238;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (238, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 238;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(238, 1, 'V', 'major', NULL, NULL),
(238, 2, 'ii', 'minor', NULL, NULL),
(238, 3, 'iii', 'minor', NULL, NULL),
(238, 4, 'IV', 'major', NULL, NULL);

-- 239. V - III7 - vi - V (세컨더리 도미넌트 폭발 프리코러스) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (239, 'V - III7 - vi - V (세컨더리 도미넌트 폭발 프리코러스)', 'III7으로 가슴 저린 긴장감을 터뜨린 후 5도로 다시 코러스를 준비하는 극적 진행', 90, 96, 'secondary_dominant', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 239;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (239, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 239;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(239, 1, 'V', 'major', NULL, NULL),
(239, 2, 'III', 'dominant', '7', NULL),
(239, 3, 'vi', 'minor', NULL, NULL),
(239, 4, 'V', 'major', NULL, NULL);

-- 240. V - vi - V - V (마지막 2마디 도미넌트 드라이브) [Pre-Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (240, 'V - vi - V - V (마지막 2마디 도미넌트 드라이브)', '마지막 2마디를 5도로 꽉 채우며 관객의 환호를 유도하는 페스티벌형 프리코러스', 93, 91, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 240;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (240, 'Pre-Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 240;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(240, 1, 'V', 'major', NULL, NULL),
(240, 2, 'vi', 'minor', NULL, NULL),
(240, 3, 'V', 'major', NULL, NULL),
(240, 4, 'V', 'major', NULL, NULL);

-- 241. V - IV - I - I (도미넌트 출발 록 앤섬 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (241, 'V - IV - I - I (도미넌트 출발 록 앤섬 후렴)', '5도에서 4-1로 시원하게 종지하며 떼창을 유도하는 오아시스/그린데이 스타일 록 후렴', 92, 93, 'cadence_resolution', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 241;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (241, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 241;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(241, 1, 'V', 'major', NULL, NULL),
(241, 2, 'IV', 'major', NULL, NULL),
(241, 3, 'I', 'major', NULL, NULL),
(241, 4, 'I', 'major', NULL, NULL);

-- 242. V - vi - IV - I (5도 출발 팝 4코드 훅 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (242, 'V - vi - IV - I (5도 출발 팝 4코드 훅 코러스)', '5도로 귀를 사로잡은 뒤 6-4-1로 캐치하게 전개되는 전 세계 히트 팝 시그니처 후렴', 97, 96, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 242;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (242, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 242;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(242, 1, 'V', 'major', NULL, NULL),
(242, 2, 'vi', 'minor', NULL, NULL),
(242, 3, 'IV', 'major', NULL, NULL),
(242, 4, 'I', 'major', NULL, NULL);

-- 243. V - IV - vi - I (J-Rock 스타일 5-4-6-1 질주 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (243, 'V - IV - vi - I (J-Rock 스타일 5-4-6-1 질주 후렴)', '5-4-6-1의 역동적인 도수 전개로 청량하고 시원한 질주감을 선사하는 J-Rock 코러스', 96, 93, 'jrock_anthem', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 243;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (243, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 243;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(243, 1, 'V', 'major', NULL, NULL),
(243, 2, 'IV', 'major', NULL, NULL),
(243, 3, 'vi', 'minor', NULL, NULL),
(243, 4, 'I', 'major', NULL, NULL);

-- 244. V - I - IV - V (당당한 클래식 팝 앤섬 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (244, 'V - I - IV - V (당당한 클래식 팝 앤섬 코러스)', '5-1로 당당하게 해결한 뒤 4-5로 다음 소절을 시원하게 부르는 클래식 팝 후렴', 94, 96, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 244;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (244, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 244;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(244, 1, 'V', 'major', NULL, NULL),
(244, 2, 'I', 'major', NULL, NULL),
(244, 3, 'IV', 'major', NULL, NULL),
(244, 4, 'V', 'major', NULL, NULL);

-- 245. V - vi - IV - V (벅차오르는 감성 록 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (245, 'V - vi - IV - V (벅차오르는 감성 록 후렴)', '5-6-4-5의 순환으로 벅차오르는 감정을 쉼 없이 쏟아내는 감성 밴드 코러스', 91, 91, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 245;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (245, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 245;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(245, 1, 'V', 'major', NULL, NULL),
(245, 2, 'vi', 'minor', NULL, NULL),
(245, 3, 'IV', 'major', NULL, NULL),
(245, 4, 'V', 'major', NULL, NULL);

-- 246. V - IV - I - vi (서정적 멜로디 극대화 모던 팝 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (246, 'V - IV - I - vi (서정적 멜로디 극대화 모던 팝 후렴)', '5-4-1로 낙하 후 6도로 감싸며 보컬의 감성을 극대화하는 모던 팝/K-Pop 후렴', 93, 93, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 246;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (246, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 246;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(246, 1, 'V', 'major', NULL, NULL),
(246, 2, 'IV', 'major', NULL, NULL),
(246, 3, 'I', 'major', NULL, NULL),
(246, 4, 'vi', 'minor', NULL, NULL);

-- 247. V - bVII - IV - I (시원한 믹솔리디안 록 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (247, 'V - bVII - IV - I (시원한 믹솔리디안 록 코러스)', 'bVII 모달 인터체인지로 시원하고 거친 록 스피릿을 폭발시키는 브릿팝/하드록 후렴', 93, 91, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 247;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (247, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 247;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(247, 1, 'V', 'major', NULL, NULL),
(247, 2, 'bVII', 'major', NULL, NULL),
(247, 3, 'IV', 'major', NULL, NULL),
(247, 4, 'I', 'major', NULL, NULL);

-- 248. V - vi - iii - IV (애틋한 발라드/밴드 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (248, 'V - vi - iii - IV (애틋한 발라드/밴드 후렴)', '5도에서 시작하여 6-3-4로 유려하게 흘러가는 눈물샘 자극 멜로딕 록 코러스', 92, 92, 'royal_road', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 248;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (248, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 248;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(248, 1, 'V', 'major', NULL, NULL),
(248, 2, 'vi', 'minor', NULL, NULL),
(248, 3, 'iii', 'minor', NULL, NULL),
(248, 4, 'IV', 'major', NULL, NULL);

-- 249. V - I - vi - IV (5-1 시원한 해소 후 둘룹 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (249, 'V - I - vi - IV (5-1 시원한 해소 후 둘룹 코러스)', '5-1로 시원하게 해소된 후 6-4로 편안하게 감정을 실어주는 대중 팝 후렴', 91, 91, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 249;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (249, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 249;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(249, 1, 'V', 'major', NULL, NULL),
(249, 2, 'I', 'major', NULL, NULL),
(249, 3, 'vi', 'minor', NULL, NULL),
(249, 4, 'IV', 'major', NULL, NULL);

-- 250. V - IV - iii - vi (왕도 진행 5도 출발 변형 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (250, 'V - IV - iii - vi (왕도 진행 5도 출발 변형 코러스)', '왕도 진행의 앞에 5도를 배치하여 색다른 도입감과 익숙한 해결감을 주는 J-Pop 코러스', 97, 90, 'royal_road', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 250;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (250, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 250;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(250, 1, 'V', 'major', NULL, NULL),
(250, 2, 'IV', 'major', NULL, NULL),
(250, 3, 'iii', 'minor', NULL, NULL),
(250, 4, 'vi', 'minor', NULL, NULL);

-- 251. V - bVI - bVII - I (모달 카덴스 에픽 피날레 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (251, 'V - bVI - bVII - I (모달 카덴스 에픽 피날레 코러스)', '5도에서 bVI-bVII로 힘차게 도약하여 1도로 폭발하는 웅장하고 드라마틱한 후렴', 95, 95, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 251;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (251, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 251;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(251, 1, 'V', 'major', NULL, NULL),
(251, 2, 'bVI', 'major', NULL, NULL),
(251, 3, 'bVII', 'major', NULL, NULL),
(251, 4, 'I', 'major', NULL, NULL);

-- 252. V - vi - I - IV (청량하고 탁 트인 K-Pop 밴드 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (252, 'V - vi - I - IV (청량하고 탁 트인 K-Pop 밴드 후렴)', '5-6-1-4로 가슴 벅찬 여름 바다 같은 청량감을 선사하는 아이돌 밴드형 후렴', 97, 96, 'subdominant_start', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 252;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (252, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 252;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(252, 1, 'V', 'major', NULL, NULL),
(252, 2, 'vi', 'minor', NULL, NULL),
(252, 3, 'I', 'major', NULL, NULL),
(252, 4, 'IV', 'major', NULL, NULL);

-- 253. V - IV - iv - I (서브도미넌트 마이너 감성 폭발 후렴) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (253, 'V - IV - iv - I (서브도미넌트 마이너 감성 폭발 후렴)', '4도 마이너(iv)의 애절한 색채로 후렴구의 감정선을 최고조로 끌어올리는 발라드 코러스', 95, 90, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 253;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (253, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 253;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(253, 1, 'V', 'major', NULL, NULL),
(253, 2, 'IV', 'major', NULL, NULL),
(253, 3, 'IV', 'minor', NULL, NULL),
(253, 4, 'I', 'major', NULL, NULL);

-- 254. V - I - IV - I (직관적 중독성 팝 앤섬 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (254, 'V - I - IV - I (직관적 중독성 팝 앤섬 코러스)', '누구나 한 번 들으면 따라 부를 수 있는 직관적이고 강력한 멜로디 친화적 후렴', 95, 95, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 254;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (254, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 254;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(254, 1, 'V', 'major', NULL, NULL),
(254, 2, 'I', 'major', NULL, NULL),
(254, 3, 'IV', 'major', NULL, NULL),
(254, 4, 'I', 'major', NULL, NULL);

-- 255. V - iii - vi - IV (풍성한 멜로디 라인 지탱 코러스) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (255, 'V - iii - vi - IV (풍성한 멜로디 라인 지탱 코러스)', '3-6-4로 이어지며 멜로디의 화려한 고음을 완벽하게 받쳐주는 감성 록 후렴', 91, 89, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 255;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (255, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 255;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(255, 1, 'V', 'major', NULL, NULL),
(255, 2, 'iii', 'minor', NULL, NULL),
(255, 3, 'vi', 'minor', NULL, NULL),
(255, 4, 'IV', 'major', NULL, NULL);

-- 256. V - IV - I - V (페스티벌 떼창 유도 록 후렴 루프) [Chorus]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (256, 'V - IV - I - V (페스티벌 떼창 유도 록 후렴 루프)', '5-4-1-5의 무한 순환으로 페스티벌 현장을 열광시키는 대표적인 록앤섬 코러스', 92, 90, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 256;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (256, 'Chorus');
DELETE FROM system_progression_steps WHERE progression_id = 256;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(256, 1, 'V', 'major', NULL, NULL),
(256, 2, 'IV', 'major', NULL, NULL),
(256, 3, 'I', 'major', NULL, NULL),
(256, 4, 'V', 'major', NULL, NULL);

-- 257. V - vi - IV - I (간주 솔로 표준 순환 진행) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (257, 'V - vi - IV - I (간주 솔로 표준 순환 진행)', '기타나 건반 솔로가 유려하게 기량을 뽐낼 수 있도록 탄탄하게 받쳐주는 간주 진행', 90, 94, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 257;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (257, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 257;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(257, 1, 'V', 'major', NULL, NULL),
(257, 2, 'vi', 'minor', NULL, NULL),
(257, 3, 'IV', 'major', NULL, NULL),
(257, 4, 'I', 'major', NULL, NULL);

-- 258. V - IV - I - V (호쾌한 기타 리프 중심 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (258, 'V - IV - I - V (호쾌한 기타 리프 중심 간주)', '묵직한 디스토션 기타 리프와 파워코드가 돋보이는 스트레이트 록 인터루드', 96, 89, 'vamp', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 258;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (258, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 258;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(258, 1, 'V', 'major', NULL, NULL),
(258, 2, 'IV', 'major', NULL, NULL),
(258, 3, 'I', 'major', NULL, NULL),
(258, 4, 'V', 'major', NULL, NULL);

-- 259. V - bVII - IV - I (믹솔리디안 블루지 솔로 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (259, 'V - bVII - IV - I (믹솔리디안 블루지 솔로 간주)', 'bVII 화음으로 블루스/하드록 특유의 끈적하고 화려한 벤딩 솔로를 연출하는 간주', 90, 95, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 259;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (259, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 259;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(259, 1, 'V', 'major', NULL, NULL),
(259, 2, 'bVII', 'major', NULL, NULL),
(259, 3, 'IV', 'major', NULL, NULL),
(259, 4, 'I', 'major', NULL, NULL);

-- 260. V - vi - iii - vi (단조 감성 극대화 서정 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (260, 'V - vi - iii - vi (단조 감성 극대화 서정 간주)', '6도와 3도를 중심으로 차분하고 애절한 악기 멜로디를 선보이는 발라드 간주', 90, 92, 'royal_road', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 260;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (260, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 260;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(260, 1, 'V', 'major', NULL, NULL),
(260, 2, 'vi', 'minor', NULL, NULL),
(260, 3, 'iii', 'minor', NULL, NULL),
(260, 4, 'vi', 'minor', NULL, NULL);

-- 261. V - IV - iii - ii (순차 하강 아르페지오 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (261, 'V - IV - iii - ii (순차 하강 아르페지오 간주)', '건반의 맑은 아르페지오나 어쿠스틱 기타 선율이 계단식으로 떨어지는 서정적 간주', 92, 89, 'descending_line', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 261;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (261, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 261;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(261, 1, 'V', 'major', NULL, NULL),
(261, 2, 'IV', 'major', NULL, NULL),
(261, 3, 'iii', 'minor', NULL, NULL),
(261, 4, 'ii', 'minor', NULL, NULL);

-- 262. V - ii - V - I (2-5-1 재즈 팝 턴어라운드 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (262, 'V - ii - V - I (2-5-1 재즈 팝 턴어라운드 간주)', '도미넌트 출발 후 2-5-1로 세련되게 완결되는 재즈/네오소울 팝 인터루드', 90, 95, 'circle_of_fifths', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 262;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (262, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 262;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(262, 1, 'V', 'major', NULL, NULL),
(262, 2, 'ii', 'minor', NULL, NULL),
(262, 3, 'V', 'dominant', '7', NULL),
(262, 4, 'I', 'major', NULL, NULL);

-- 263. V - bVI - bVII - I (서사적 신스/오케스트라 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (263, 'V - bVI - bVII - I (서사적 신스/오케스트라 간주)', '모달 인터체인지로 영화 같은 웅장함과 카타르시스를 연출하는 에픽 간주', 96, 94, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 263;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (263, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 263;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(263, 1, 'V', 'major', NULL, NULL),
(263, 2, 'bVI', 'major', NULL, NULL),
(263, 3, 'bVII', 'major', NULL, NULL),
(263, 4, 'I', 'major', NULL, NULL);

-- 264. V - IV - vi - V (질주감 넘치는 드럼 브레이크 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (264, 'V - IV - vi - V (질주감 넘치는 드럼 브레이크 간주)', '드럼과 베이스의 리드미컬한 브레이크가 돋보이는 박진감 넘치는 밴드 인터루드', 94, 90, 'jrock_anthem', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 264;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (264, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 264;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(264, 1, 'V', 'major', NULL, NULL),
(264, 2, 'IV', 'major', NULL, NULL),
(264, 3, 'vi', 'minor', NULL, NULL),
(264, 4, 'V', 'major', NULL, NULL);

-- 265. V - I - IV - V (메인 테마 각인 턴어라운드 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (265, 'V - I - IV - V (메인 테마 각인 턴어라운드 간주)', '곡의 시그니처 멜로디를 변형 연주하여 다음 절로 자연스럽게 연결하는 브릿지형 간주', 92, 96, 'standard_turnaround', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 265;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (265, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 265;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(265, 1, 'V', 'major', NULL, NULL),
(265, 2, 'I', 'major', NULL, NULL),
(265, 3, 'IV', 'major', NULL, NULL),
(265, 4, 'V', 'major', NULL, NULL);

-- 266. V - vi - ii - V (세련된 R&B 어번 루프 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (266, 'V - vi - ii - V (세련된 R&B 어번 루프 간주)', '그루비한 베이스 라인과 함께 무대 분위기를 달구는 어반/R&B 팝 간주', 97, 94, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 266;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (266, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 266;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(266, 1, 'V', 'major', NULL, NULL),
(266, 2, 'vi', 'minor', NULL, NULL),
(266, 3, 'ii', 'minor', NULL, NULL),
(266, 4, 'V', 'major', NULL, NULL);

-- 267. V - IV - I - IV (펑키 베이스 슬랩 그루브 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (267, 'V - IV - I - IV (펑키 베이스 슬랩 그루브 간주)', '베이스 슬랩 주법과 펑키 기타 커팅에 최적화된 2코드 중심 인터루드', 90, 96, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 267;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (267, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 267;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(267, 1, 'V', 'major', NULL, NULL),
(267, 2, 'IV', 'major', NULL, NULL),
(267, 3, 'I', 'major', NULL, NULL),
(267, 4, 'IV', 'major', NULL, NULL);

-- 268. V - iii - vi - IV (감성 색소폰/바이올린 솔로 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (268, 'V - iii - vi - IV (감성 색소폰/바이올린 솔로 간주)', '관악기나 현악기 솔로가 가슴 깊이 파고드는 멜로디를 노래할 수 있는 발라드 간주', 92, 90, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 268;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (268, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 268;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(268, 1, 'V', 'major', NULL, NULL),
(268, 2, 'iii', 'minor', NULL, NULL),
(268, 3, 'vi', 'minor', NULL, NULL),
(268, 4, 'IV', 'major', NULL, NULL);

-- 269. V - VI7 - ii - V (세컨더리 도미넌트 화려한 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (269, 'V - VI7 - ii - V (세컨더리 도미넌트 화려한 간주)', 'VI7으로 순간 긴장감을 높여 테크니컬한 솔로 프레이즈를 빛나게 하는 재즈 팝 간주', 93, 95, 'secondary_dominant', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 269;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (269, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 269;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(269, 1, 'V', 'major', NULL, NULL),
(269, 2, 'VI', 'dominant', '7', NULL),
(269, 3, 'ii', 'minor', NULL, NULL),
(269, 4, 'V', 'major', NULL, NULL);

-- 270. V - IV - iv - I (서브도미넌트 마이너 감동 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (270, 'V - IV - iv - I (서브도미넌트 마이너 감동 간주)', '4도 마이너의 눈물겨운 전개로 곡의 절정을 향해 달려가는 브릿지 직전 간주', 91, 89, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 270;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (270, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 270;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(270, 1, 'V', 'major', NULL, NULL),
(270, 2, 'IV', 'major', NULL, NULL),
(270, 3, 'IV', 'minor', NULL, NULL),
(270, 4, 'I', 'major', NULL, NULL);

-- 271. V - I - vi - IV (희망찬 밴드 앙상블 간주) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (271, 'V - I - vi - IV (희망찬 밴드 앙상블 간주)', '모든 악기가 하나가 되어 멜로디를 뿜어내는 밝고 희망찬 밴드 사운드 간주', 97, 93, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 271;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (271, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 271;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(271, 1, 'V', 'major', NULL, NULL),
(271, 2, 'I', 'major', NULL, NULL),
(271, 3, 'vi', 'minor', NULL, NULL),
(271, 4, 'IV', 'major', NULL, NULL);

-- 272. V - vi - V - vi (긴장·해소 교차 2코드 솔로 배틀) [Interlude]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (272, 'V - vi - V - vi (긴장·해소 교차 2코드 솔로 배틀)', '기타와 건반이 번갈아가며 솔로를 주고받기에 안성맞춤인 긴장 루프 간주', 91, 90, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 272;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (272, 'Interlude');
DELETE FROM system_progression_steps WHERE progression_id = 272;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(272, 1, 'V', 'major', NULL, NULL),
(272, 2, 'vi', 'minor', NULL, NULL),
(272, 3, 'V', 'major', NULL, NULL),
(272, 4, 'vi', 'minor', NULL, NULL);

-- 273. V - vi - IV - V (브릿지 드라마틱 긴장 고조) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (273, 'V - vi - IV - V (브릿지 드라마틱 긴장 고조)', '코러스와의 대비를 주며 곡 전체의 에너지를 최고조로 끌어올리는 브릿지 진행', 92, 96, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 273;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (273, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 273;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(273, 1, 'V', 'major', NULL, NULL),
(273, 2, 'vi', 'minor', NULL, NULL),
(273, 3, 'IV', 'major', NULL, NULL),
(273, 4, 'V', 'major', NULL, NULL);

-- 274. V - IV - iii - vi (차분한 하강 후 고조 발라드 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (274, 'V - IV - iii - vi (차분한 하강 후 고조 발라드 브릿지)', '한 번 차분하게 가라앉았다가 후렴구로 벅차오르게 이어지는 서정적 브릿지', 92, 90, 'royal_road', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 274;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (274, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 274;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(274, 1, 'V', 'major', NULL, NULL),
(274, 2, 'IV', 'major', NULL, NULL),
(274, 3, 'iii', 'minor', NULL, NULL),
(274, 4, 'vi', 'minor', NULL, NULL);

-- 275. V - bVI - bVII - I (모달 인터체인지 분위기 반전 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (275, 'V - bVI - bVII - I (모달 인터체인지 분위기 반전 브릿지)', 'bVI-bVII 차용화음으로 곡의 색채를 완전히 뒤바꾸며 시선을 집중시키는 브릿지', 94, 93, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 275;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (275, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 275;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(275, 1, 'V', 'major', NULL, NULL),
(275, 2, 'bVI', 'major', NULL, NULL),
(275, 3, 'bVII', 'major', NULL, NULL),
(275, 4, 'I', 'major', NULL, NULL);

-- 276. V - IV - iv - I (서브도미넌트 마이너 애절함 극대화) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (276, 'V - IV - iv - I (서브도미넌트 마이너 애절함 극대화)', '4도 마이너의 애절한 색채로 보컬의 고음과 감정을 폭발시키는 눈물의 브릿지', 93, 91, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 276;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (276, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 276;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(276, 1, 'V', 'major', NULL, NULL),
(276, 2, 'IV', 'major', NULL, NULL),
(276, 3, 'IV', 'minor', NULL, NULL),
(276, 4, 'I', 'major', NULL, NULL);

-- 277. V - III7 - vi - IV (세컨더리 도미넌트 비장미 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (277, 'V - III7 - vi - IV (세컨더리 도미넌트 비장미 브릿지)', 'III7의 강렬한 도미넌트 사운드로 드라마틱한 비장미를 연출하는 시그니처 브릿지', 95, 89, 'secondary_dominant', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 277;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (277, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 277;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(277, 1, 'V', 'major', NULL, NULL),
(277, 2, 'III', 'dominant', '7', NULL),
(277, 3, 'vi', 'minor', NULL, NULL),
(277, 4, 'IV', 'major', NULL, NULL);

-- 278. V - bVII - IV - I (록킹 믹솔리디안 브릿팝 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (278, 'V - bVII - IV - I (록킹 믹솔리디안 브릿팝 브릿지)', 'bVII로 시원하게 터뜨리며 분위기를 유쾌하고 웅장하게 반전시키는 록 브릿지', 93, 89, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 278;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (278, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 278;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(278, 1, 'V', 'major', NULL, NULL),
(278, 2, 'bVII', 'major', NULL, NULL),
(278, 3, 'IV', 'major', NULL, NULL),
(278, 4, 'I', 'major', NULL, NULL);

-- 279. V - vi - ii - V (2-5 점진 상승 K-Pop 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (279, 'V - vi - ii - V (2-5 점진 상승 K-Pop 브릿지)', '2-5 진행을 통해 마지막 후렴의 폭발력을 정교하게 조율하는 세련된 K-Pop 브릿지', 97, 92, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 279;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (279, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 279;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(279, 1, 'V', 'major', NULL, NULL),
(279, 2, 'vi', 'minor', NULL, NULL),
(279, 3, 'ii', 'minor', NULL, NULL),
(279, 4, 'V', 'major', NULL, NULL);

-- 280. V - IV - I - vi (서정적 멜로디 중심 발라드 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (280, 'V - IV - I - vi (서정적 멜로디 중심 발라드 브릿지)', '악기를 비우고 보컬 솔로에 집중할 수 있도록 돕는 따뜻하고 감성적인 브릿지', 93, 95, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 280;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (280, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 280;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(280, 1, 'V', 'major', NULL, NULL),
(280, 2, 'IV', 'major', NULL, NULL),
(280, 3, 'I', 'major', NULL, NULL),
(280, 4, 'vi', 'minor', NULL, NULL);

-- 281. V - ii - IV - V (어쿠스틱 감성 차분한 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (281, 'V - ii - IV - V (어쿠스틱 감성 차분한 브릿지)', '담담하게 이야기를 정리한 후 마지막 사비를 향해 4-5로 상승하는 어쿠스틱 브릿지', 93, 90, 'stepwise_ascent', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 281;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (281, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 281;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(281, 1, 'V', 'major', NULL, NULL),
(281, 2, 'ii', 'minor', NULL, NULL),
(281, 3, 'IV', 'major', NULL, NULL),
(281, 4, 'V', 'major', NULL, NULL);

-- 282. V - vi - bVI - V (반음 하강 텐션 드라마틱 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (282, 'V - vi - bVI - V (반음 하강 텐션 드라마틱 브릿지)', 'bVI 차용화음으로 반음계적 긴장을 조성한 뒤 5도로 폭풍전야를 만드는 브릿지', 93, 93, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 282;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (282, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 282;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(282, 1, 'V', 'major', NULL, NULL),
(282, 2, 'vi', 'minor', NULL, NULL),
(282, 3, 'bVI', 'major', NULL, NULL),
(282, 4, 'V', 'major', NULL, NULL);

-- 283. V - I - IV - iv (1도 해소 직후 iv 눈물 반전 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (283, 'V - I - IV - iv (1도 해소 직후 iv 눈물 반전 브릿지)', '1도로 해결되는 듯하다가 iv로 급반전하여 관객의 눈물샘을 자극하는 반전 브릿지', 91, 94, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 283;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (283, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 283;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(283, 1, 'V', 'major', NULL, NULL),
(283, 2, 'I', 'major', NULL, NULL),
(283, 3, 'IV', 'major', NULL, NULL),
(283, 4, 'IV', 'minor', NULL, NULL);

-- 284. V - IV - V - I (도미넌트 텐션 후 1도 완전 해결) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (284, 'V - IV - V - I (도미넌트 텐션 후 1도 완전 해결)', '치열한 화성 전개 끝에 1도로 호쾌하게 떨어지며 마지막 후렴으로 직행하는 브릿지', 96, 89, 'cadence_resolution', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 284;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (284, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 284;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(284, 1, 'V', 'major', NULL, NULL),
(284, 2, 'IV', 'major', NULL, NULL),
(284, 3, 'V', 'major', NULL, NULL),
(284, 4, 'I', 'major', NULL, NULL);

-- 285. V - iii - vi - II7 (더블 도미넌트 II7 화려한 상승) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (285, 'V - iii - vi - II7 (더블 도미넌트 II7 화려한 상승)', 'II7(V/V) 더블 도미넌트로 극적인 긴장을 폭발시키며 코러스로 연결하는 브릿지', 91, 96, 'secondary_dominant', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 285;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (285, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 285;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(285, 1, 'V', 'major', NULL, NULL),
(285, 2, 'iii', 'minor', NULL, NULL),
(285, 3, 'vi', 'minor', NULL, NULL),
(285, 4, 'II', 'dominant', '7', NULL);

-- 286. V - vi - IV - I (자연스럽고 편안한 팝 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (286, 'V - vi - IV - I (자연스럽고 편안한 팝 브릿지)', '무리한 전조 없이 편안하게 곡의 서사를 완결로 이끄는 대중적인 브릿지', 96, 90, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 286;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (286, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 286;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(286, 1, 'V', 'major', NULL, NULL),
(286, 2, 'vi', 'minor', NULL, NULL),
(286, 3, 'IV', 'major', NULL, NULL),
(286, 4, 'I', 'major', NULL, NULL);

-- 287. V - bVII - bVI - V (마이너 스케일 어둠 전환 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (287, 'V - bVII - bVI - V (마이너 스케일 어둠 전환 브릿지)', 'bVII-bVI로 어둡고 장엄하게 가라앉은 뒤 5도 킥으로 탈출하는 다크 록 브릿지', 94, 96, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 287;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (287, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 287;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(287, 1, 'V', 'major', NULL, NULL),
(287, 2, 'bVII', 'major', NULL, NULL),
(287, 3, 'bVI', 'major', NULL, NULL),
(287, 4, 'V', 'major', NULL, NULL);

-- 288. V - IV - iii - ii (하강 스텝와이즈 텐션 브릿지) [Bridge]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (288, 'V - IV - iii - ii (하강 스텝와이즈 텐션 브릿지)', '5도에서 2도까지 순차 하강하며 담담하게 슬픔을 노래하는 멜로딕 브릿지', 90, 95, 'descending_line', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 288;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (288, 'Bridge');
DELETE FROM system_progression_steps WHERE progression_id = 288;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(288, 1, 'V', 'major', NULL, NULL),
(288, 2, 'IV', 'major', NULL, NULL),
(288, 3, 'iii', 'minor', NULL, NULL),
(288, 4, 'ii', 'minor', NULL, NULL);

-- 289. V - IV - I - I (클래식 록 완전 종지 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (289, 'V - IV - I - I (클래식 록 완전 종지 아웃트로)', '5도에서 4-1로 웅장하게 해결되며 곡의 완벽한 피날레를 선언하는 록 아웃트로', 95, 92, 'cadence_resolution', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 289;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (289, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 289;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(289, 1, 'V', 'major', NULL, NULL),
(289, 2, 'IV', 'major', NULL, NULL),
(289, 3, 'I', 'major', NULL, NULL),
(289, 4, 'I', 'major', NULL, NULL);

-- 290. V - vi - IV - I (페이드아웃 최적화 팝 4코드 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (290, 'V - vi - IV - I (페이드아웃 최적화 팝 4코드 아웃트로)', '여운을 남기며 무한 반복되다가 서서히 페이드아웃되는 대중음악 표준 아웃트로', 95, 89, 'diatonic_pop', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 290;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (290, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 290;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(290, 1, 'V', 'major', NULL, NULL),
(290, 2, 'vi', 'minor', NULL, NULL),
(290, 3, 'IV', 'major', NULL, NULL),
(290, 4, 'I', 'major', NULL, NULL);

-- 291. V - IV - iv - I (서브도미넌트 마이너 짙은 여운 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (291, 'V - IV - iv - I (서브도미넌트 마이너 짙은 여운 엔딩)', '4도 마이너의 애절함을 남겨 곡이 끝난 뒤에도 깊은 감동을 머금게 하는 엔딩', 90, 94, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 291;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (291, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 291;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(291, 1, 'V', 'major', NULL, NULL),
(291, 2, 'IV', 'major', NULL, NULL),
(291, 3, 'IV', 'minor', NULL, NULL),
(291, 4, 'I', 'major', NULL, NULL);

-- 292. V - bVI - bVII - I (서사적 피날레 마리오 카덴스 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (292, 'V - bVI - bVII - I (서사적 피날레 마리오 카덴스 엔딩)', 'bVI-bVII-I의 웅장한 카덴스로 대서사시의 막을 내리는 블록버스터급 아웃트로', 95, 94, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 292;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (292, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 292;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(292, 1, 'V', 'major', NULL, NULL),
(292, 2, 'bVI', 'major', NULL, NULL),
(292, 3, 'bVII', 'major', NULL, NULL),
(292, 4, 'I', 'major', NULL, NULL);

-- 293. V - I - IV - I (소박하고 따뜻한 어쿠스틱 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (293, 'V - I - IV - I (소박하고 따뜻한 어쿠스틱 엔딩)', '마지막 현의 울림과 함께 따뜻하게 마무리되는 포크/싱어송라이터 아웃트로', 93, 96, 'diatonic_pop', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 293;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (293, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 293;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(293, 1, 'V', 'major', NULL, NULL),
(293, 2, 'I', 'major', NULL, NULL),
(293, 3, 'IV', 'major', NULL, NULL),
(293, 4, 'I', 'major', NULL, NULL);

-- 294. V - IV - I - V (순환 반복 페스티벌 록 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (294, 'V - IV - I - V (순환 반복 페스티벌 록 아웃트로)', '5-4-1-5의 신나는 리프로 관객과 함께 호흡하며 끝없이 이어지는 라이브 록 엔딩', 92, 95, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 294;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (294, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 294;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(294, 1, 'V', 'major', NULL, NULL),
(294, 2, 'IV', 'major', NULL, NULL),
(294, 3, 'I', 'major', NULL, NULL),
(294, 4, 'V', 'major', NULL, NULL);

-- 295. V - vi - iii - IV (아련한 기억을 떠올리는 서정 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (295, 'V - vi - iii - IV (아련한 기억을 떠올리는 서정 엔딩)', '4도로 열어두며 긴 여운과 아련함을 남기는 영화/드라마 OST형 아웃트로', 90, 95, 'royal_road', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 295;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (295, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 295;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(295, 1, 'V', 'major', NULL, NULL),
(295, 2, 'vi', 'minor', NULL, NULL),
(295, 3, 'iii', 'minor', NULL, NULL),
(295, 4, 'IV', 'major', NULL, NULL);

-- 296. V - I - I - I (5-1 완전 해결 롱톤 안정 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (296, 'V - I - I - I (5-1 완전 해결 롱톤 안정 엔딩)', '5도에서 1도로 해결된 후 1도의 화음이 길게 울리며 안정감을 선사하는 종결형 아웃트로', 92, 95, 'cadence_resolution', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 296;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (296, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 296;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(296, 1, 'V', 'major', NULL, NULL),
(296, 2, 'I', 'major', NULL, NULL),
(296, 3, 'I', 'major', NULL, NULL),
(296, 4, 'I', 'major', NULL, NULL);

-- 297. V - bVII - IV - I (라이브 공연 피날레 믹솔리디안 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (297, 'V - bVII - IV - I (라이브 공연 피날레 믹솔리디안 엔딩)', 'bVII 플랫세븐스 사운드로 호쾌하게 드럼과 심벌을 연타하며 끝내는 록 엔딩', 91, 94, 'modal_interchange', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 297;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (297, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 297;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(297, 1, 'V', 'major', NULL, NULL),
(297, 2, 'bVII', 'major', NULL, NULL),
(297, 3, 'IV', 'major', NULL, NULL),
(297, 4, 'I', 'major', NULL, NULL);

-- 298. V - vi - IV - V (완결되지 않고 여운을 남기는 오픈형 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (298, 'V - vi - IV - V (완결되지 않고 여운을 남기는 오픈형 엔딩)', '마지막 순간 5도로 열어두어 곡의 다음 챕터를 상상하게 만드는 오픈형 아웃트로', 93, 92, 'tension_build', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 298;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (298, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 298;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(298, 1, 'V', 'major', NULL, NULL),
(298, 2, 'vi', 'minor', NULL, NULL),
(298, 3, 'IV', 'major', NULL, NULL),
(298, 4, 'V', 'major', NULL, NULL);

-- 299. V - ii - V - I (스탠다드 재즈 팝 2-5-1 종결 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (299, 'V - ii - V - I (스탠다드 재즈 팝 2-5-1 종결 아웃트로)', '2-5-1 완벽한 카덴스로 단정하고 고급스럽게 매듭을 짓는 재즈/팝 아웃트로', 97, 89, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 299;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (299, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 299;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(299, 1, 'V', 'major', NULL, NULL),
(299, 2, 'ii', 'minor', NULL, NULL),
(299, 3, 'V', 'dominant', '7', NULL),
(299, 4, 'I', 'major', NULL, NULL);

-- 300. V - IV - iii - I (차분하게 정리되는 스텝 하강 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (300, 'V - IV - iii - I (차분하게 정리되는 스텝 하강 아웃트로)', '5도에서 1도까지 차분하게 내려오며 잔잔한 피아노 타건으로 끝맺는 발라드 엔딩', 95, 90, 'descending_line', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 300;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (300, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 300;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(300, 1, 'V', 'major', NULL, NULL),
(300, 2, 'IV', 'major', NULL, NULL),
(300, 3, 'iii', 'minor', NULL, NULL),
(300, 4, 'I', 'major', NULL, NULL);

-- 301. V - vi - ii - I (도회적 여운을 남기는 R&B 팝 아웃트로) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (301, 'V - vi - ii - I (도회적 여운을 남기는 R&B 팝 아웃트로)', '그루비한 베이스 라인이 서서히 잦아들며 부드럽게 1도로 안착하는 네오소울/R&B 아웃트로', 94, 95, 'circle_of_fifths', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 301;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (301, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 301;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(301, 1, 'V', 'major', NULL, NULL),
(301, 2, 'vi', 'minor', NULL, NULL),
(301, 3, 'ii', 'minor', NULL, NULL),
(301, 4, 'I', 'major', NULL, NULL);

-- 302. V - IV - I - IV (2코드 뱀프로 페이드아웃되는 라이브 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (302, 'V - IV - I - IV (2코드 뱀프로 페이드아웃되는 라이브 엔딩)', '4도와 1도의 그루브를 타며 멤버 소개와 함께 마무리되는 밴드 라이브 아웃트로', 90, 89, 'vamp', 9, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 302;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (302, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 302;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(302, 1, 'V', 'major', NULL, NULL),
(302, 2, 'IV', 'major', NULL, NULL),
(302, 3, 'I', 'major', NULL, NULL),
(302, 4, 'IV', 'major', NULL, NULL);

-- 303. V - bVI - I - I (독특하고 몽환적인 모달 엔딩) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (303, 'V - bVI - I - I (독특하고 몽환적인 모달 엔딩)', 'bVI의 깜짝 등장 후 1도로 안착하여 신비로운 여운을 남기는 환상곡형 엔딩', 94, 96, 'modal_interchange', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 303;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (303, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 303;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(303, 1, 'V', 'major', NULL, NULL),
(303, 2, 'bVI', 'major', NULL, NULL),
(303, 3, 'I', 'major', NULL, NULL),
(303, 4, 'I', 'major', NULL, NULL);

-- 304. V - I - V - I (단호한 정격 종지 피날레) [Outro]
INSERT OR REPLACE INTO system_recommendation_progressions (id, name, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (304, 'V - I - V - I (단호한 정격 종지 피날레)', '5-1-5-1의 강력한 정격 종지로 일체의 망설임 없이 확실한 마침표를 찍는 피날레', 94, 90, 'cadence_resolution', 10, datetime('now'));
DELETE FROM system_progression_form_tags WHERE progression_id = 304;
INSERT INTO system_progression_form_tags (progression_id, form_tag) VALUES (304, 'Outro');
DELETE FROM system_progression_steps WHERE progression_id = 304;
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(304, 1, 'V', 'major', NULL, NULL),
(304, 2, 'I', 'major', NULL, NULL),
(304, 3, 'V', 'major', NULL, NULL),
(304, 4, 'I', 'major', NULL, NULL);
