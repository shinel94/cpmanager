-- ==============================================================================
-- Chord Progression Manager - 시스템 추천 4마디 코드 진행 시드 데이터 (Part 5: J-Rock 특화 진행 ID 129~160)
-- 대상 테이블: system_recommendation_progressions, system_progression_steps
-- ==============================================================================

-- 129. IVmaj7 - III7 - vi7 - I7 (마루사 진행 / Just The Two of Us)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (129, 'IVmaj7 - III7 - vi7 - I7 (마루사 진행 / Just The Two of Us)', '["Chorus", "Verse", "Intro"]', '시이나 링고의 ''마루노우치 새디스틱''으로 대표되며 요아소비, 요루시카, 킹누 등 J-Rock/시티록의 상징인 최고 인기 진행', 98, 96, 'marunouchi_jrock', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(129, 1, 'IV', 'major', 'maj7', NULL),
(129, 2, 'III', 'dominant', '7', NULL),
(129, 3, 'vi', 'minor', '7', NULL),
(129, 4, 'I', 'dominant', '7', NULL);

-- 130. IVmaj7 - III7 - vi7 - Vm7 (마루사 5도 마이너 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (130, 'IVmaj7 - III7 - vi7 - Vm7 (마루사 5도 마이너 변형)', '["Chorus", "Bridge"]', '요아소비 ''밤을 달리다'' 등에서 4번째 마디에 5도 마이너(Vm7) 모달 차용을 투입해 도시적인 세련됨과 아련함을 배가한 진행', 96, 94, 'marunouchi_jrock', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(130, 1, 'IV', 'major', 'maj7', NULL),
(130, 2, 'III', 'dominant', '7', NULL),
(130, 3, 'vi', 'minor', '7', NULL),
(130, 4, 'v', 'minor', '7', NULL);

-- 131. vi - IV - V - iii (코무로 진행 원형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (131, 'vi - IV - V - iii (코무로 진행 원형)', '["Chorus", "Verse"]', '90-00년대 J-Rock/J-Pop의 황금기를 이끈 코무로 테츠야의 시그니처로, 슬프면서도 강한 질주감을 뿜어내는 진행', 94, 93, 'komuro_jrock', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(131, 1, 'vi', 'minor', NULL, NULL),
(131, 2, 'IV', 'major', NULL, NULL),
(131, 3, 'V', 'major', NULL, NULL),
(131, 4, 'iii', 'minor', NULL, NULL);

-- 132. IV - V - bVI - bVII (왕도 출발 모달 폭발 사비)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (132, 'IV - V - bVI - bVII (왕도 출발 모달 폭발 사비)', '["Chorus", "Pre-Chorus"]', '보컬로이드 및 초고속 J-Rock 밴드곡에서 후렴 후반부에 bVI-bVII 모달 인터체인지로 폭발적 에너지를 터뜨리는 진행', 95, 92, 'vocaloid_speed', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(132, 1, 'IV', 'major', NULL, NULL),
(132, 2, 'V', 'major', NULL, NULL),
(132, 3, 'bVI', 'major', NULL, NULL),
(132, 4, 'bVII', 'major', NULL, NULL);

-- 133. IV - #IVdim - V - vi (상행 패싱 디미니시 왕도)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (133, 'IV - #IVdim - V - vi (상행 패싱 디미니시 왕도)', '["Chorus", "Pre-Chorus"]', '4도와 5도 사이에 #IVdim 경과 화음을 넣어 드라마틱한 감정의 굴곡과 반음 상행의 쾌감을 선사하는 정통 애니송 기법', 93, 94, 'passing_diminished', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(133, 1, 'IV', 'major', NULL, NULL),
(133, 2, '#IV', 'diminished', NULL, NULL),
(133, 3, 'V', 'major', NULL, NULL),
(133, 4, 'vi', 'minor', NULL, NULL);

-- 134. vi - IV - V - vi (코무로 다크 질주 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (134, 'vi - IV - V - vi (코무로 다크 질주 루프)', '["Verse", "Chorus", "Intro"]', '마이너에서 출발해 1도로 해결하지 않고 다시 vi도로 되돌아와 끝없는 어둠의 질주감을 만들어내는 카게프로/록 테마', 92, 91, 'komuro_jrock', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(134, 1, 'vi', 'minor', NULL, NULL),
(134, 2, 'IV', 'major', NULL, NULL),
(134, 3, 'V', 'major', NULL, NULL),
(134, 4, 'vi', 'minor', NULL, NULL);

-- 135. IV - V - iii - VI7 (왕도 진행 6도 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (135, 'IV - V - iii - VI7 (왕도 진행 6도 세컨더리 도미넌트)', '["Chorus", "Bridge"]', '요네즈 켄시 등 현대 J-Rock 명곡에서 마지막에 VI7(V/ii)을 투입해 화려하고 세련된 전환감을 주는 왕도 진행', 91, 95, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(135, 1, 'IV', 'major', NULL, NULL),
(135, 2, 'V', 'major', NULL, NULL),
(135, 3, 'iii', 'minor', NULL, NULL),
(135, 4, 'VI', 'dominant', '7', NULL);

-- 136. I - III7 - IV - iv (드라마틱 J-Rock 록 발라드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (136, 'I - III7 - IV - iv (드라마틱 J-Rock 록 발라드)', '["Verse", "Chorus"]', '원 오크 록, 엑스 재팬, 래드윔프스 등 록 발라드의 클라이맥스에서 눈물샘을 폭발시키는 비장미의 결정체', 92, 90, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(136, 1, 'I', 'major', NULL, NULL),
(136, 2, 'III', 'dominant', '7', NULL),
(136, 3, 'IV', 'major', NULL, NULL),
(136, 4, 'iv', 'minor', NULL, NULL);

-- 137. bVI - bVII - vi - I (보컬로이드 서정 질주 후렴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (137, 'bVI - bVII - vi - I (보컬로이드 서정 질주 후렴)', '["Chorus", "Bridge"]', 'DECO*27, Neru 등 보컬로이드 히트곡에서 빠른 BPM과 함께 가슴을 울리는 서정적 멜로디를 받쳐주는 사비 진행', 90, 89, 'vocaloid_speed', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(137, 1, 'bVI', 'major', NULL, NULL),
(137, 2, 'bVII', 'major', NULL, NULL),
(137, 3, 'vi', 'minor', NULL, NULL),
(137, 4, 'I', 'major', NULL, NULL);

-- 138. IV - III7 - vi - bVII (마루사 믹솔리디안 회귀)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (138, 'IV - III7 - vi - bVII (마루사 믹솔리디안 회귀)', '["Chorus", "Verse"]', '마루사 진행의 4번째 마디에 bVII를 투입하여 록적인 에지와 블루지한 매력을 더한 킹누/오피셜히게단디즘풍 진행', 93, 91, 'marunouchi_jrock', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(138, 1, 'IV', 'major', NULL, NULL),
(138, 2, 'III', 'dominant', '7', NULL),
(138, 3, 'vi', 'minor', NULL, NULL),
(138, 4, 'bVII', 'major', NULL, NULL);

-- 139. vi - V - IV - iii (서정적 마이너 하강 J-Rock 절)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (139, 'vi - V - IV - iii (서정적 마이너 하강 J-Rock 절)', '["Verse", "Intro"]', '스피츠, 범프 오브 치킨 등 일본 청춘 록 밴드들의 절(Verse)에서 맑고 투명한 일렉기타 아르페지오와 어우러지는 진행', 89, 92, 'descending_line', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(139, 1, 'vi', 'minor', NULL, NULL),
(139, 2, 'V', 'major', NULL, NULL),
(139, 3, 'IV', 'major', NULL, NULL),
(139, 4, 'iii', 'minor', NULL, NULL);

-- 140. IV - V - vi - #Vdim (상행 디미니시 턴어라운드)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (140, 'IV - V - vi - #Vdim (상행 디미니시 턴어라운드)', '["Pre-Chorus", "Chorus"]', 'vi도에 도달한 후 #Vdim을 통해 다시 vi의 긴장감을 극대화하며 프레이즈를 끈끈하게 엮어주는 재지 J-Rock 기법', 88, 93, 'passing_diminished', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(140, 1, 'IV', 'major', NULL, NULL),
(140, 2, 'V', 'major', NULL, NULL),
(140, 3, 'vi', 'minor', NULL, NULL),
(140, 4, '#V', 'diminished', NULL, NULL);

-- 141. IV - iv - iii - VI7 (서브도미넌트 마이너 6도 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (141, 'IV - iv - iii - VI7 (서브도미넌트 마이너 6도 도미넌트)', '["Chorus", "Bridge"]', '왕도 진행의 2번째 순환에서 iv와 VI7을 연달아 사용하여 듣는 이의 감정을 뒤흔드는 J-Rock 특유의 편곡 기법', 91, 92, 'modal_interchange', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(141, 1, 'IV', 'major', NULL, NULL),
(141, 2, 'iv', 'minor', NULL, NULL),
(141, 3, 'iii', 'minor', NULL, NULL),
(141, 4, 'VI', 'dominant', '7', NULL);

-- 142. vi - V - #IVø - IV (하강 하프 디미니시 베이스 라인)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (142, 'vi - V - #IVø - IV (하강 하프 디미니시 베이스 라인)', '["Verse", "Bridge"]', '라르크 앙 시엘 등 90년대 비주얼 록/아트 록의 베이스 하강 선율에서 느껴지는 서늘하고 퇴폐적인 아름다움', 86, 89, 'descending_line', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(142, 1, 'vi', 'minor', NULL, NULL),
(142, 2, 'V', 'major', NULL, NULL),
(142, 3, '#IV', 'half-diminished', 'm7b5', NULL),
(142, 4, 'IV', 'major', NULL, NULL);

-- 143. IVmaj7 - V - iii7 - vi7 (정통 J-Rock 7th 왕도 사비)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (143, 'IVmaj7 - V - iii7 - vi7 (정통 J-Rock 7th 왕도 사비)', '["Chorus", "Intro"]', 'LiSA, SPYAIR, 유체리 등 수많은 유명 애니메이션 오프닝 곡들의 사비에서 질주감과 함께 빛을 발하는 7도 화음 왕도', 97, 94, 'royal_road', 10, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(143, 1, 'IV', 'major', 'maj7', NULL),
(143, 2, 'V', 'major', NULL, NULL),
(143, 3, 'iii', 'minor', '7', NULL),
(143, 4, 'vi', 'minor', '7', NULL);

-- 144. bVI - bVII - I - III7 (마리오 카덴스 후 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (144, 'bVI - bVII - I - III7 (마리오 카덴스 후 세컨더리 도미넌트)', '["Bridge", "Chorus"]', '모달 인터체인지로 1도에 도달한 뒤 III7(V/vi)을 강하게 타격하여 다음 마이너 파트로 드라마틱하게 던지는 브릿지', 87, 91, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(144, 1, 'bVI', 'major', NULL, NULL),
(144, 2, 'bVII', 'major', NULL, NULL),
(144, 3, 'I', 'major', NULL, NULL),
(144, 4, 'III', 'dominant', '7', NULL);

-- 145. IV - V - I - III7 (왕도 1도 후 III7 회전)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (145, 'IV - V - I - III7 (왕도 1도 후 III7 회전)', '["Chorus", "Intro"]', '1도로 안착한 후 쉬지 않고 III7을 밟아 다시 4도 또는 vi도로 튀어 오르는 끝없는 텐션의 아이돌 록/애니송 훅', 92, 93, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(145, 1, 'IV', 'major', NULL, NULL),
(145, 2, 'V', 'major', NULL, NULL),
(145, 3, 'I', 'major', NULL, NULL),
(145, 4, 'III', 'dominant', '7', NULL);

-- 146. I - V/7 - IV - V (청춘 청량 J-Rock 발라드 절)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (146, 'I - V/7 - IV - V (청춘 청량 J-Rock 발라드 절)', '["Verse", "Intro"]', '아시안 쿵푸 제너레이션, BUMP OF CHICKEN 등 맑고 순수한 청춘의 감정을 대변하는 깨끗한 기타 진행', 89, 91, 'descending_bass', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(146, 1, 'I', 'major', NULL, NULL),
(146, 2, 'V', 'major', NULL, '7'),
(146, 3, 'IV', 'major', NULL, NULL),
(146, 4, 'V', 'major', NULL, NULL);

-- 147. vi - IV - I - ii (모던 재패니즈 인디 록 턴)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (147, 'vi - IV - I - ii (모던 재패니즈 인디 록 턴)', '["Verse"]', 'Vaundy, 유우리 등 담백하고 감성적인 모던 일본 인디 록에서 보컬 멜로디의 결을 살려주는 절(Verse) 진행', 87, 90, 'diatonic_pop', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(147, 1, 'vi', 'minor', NULL, NULL),
(147, 2, 'IV', 'major', NULL, NULL),
(147, 3, 'I', 'major', NULL, NULL),
(147, 4, 'ii', 'minor', NULL, NULL);

-- 148. IV - III7 - vi - IV (마루사 4도 루프 변형)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (148, 'IV - III7 - vi - IV (마루사 4도 루프 변형)', '["Chorus", "Intro"]', '즛토마요, 요루시카 사비에서 1도 대신 4도로 돌아오며 서브도미넌트의 떠오르는 부유감을 유지하는 멜로디 루프', 93, 91, 'marunouchi_jrock', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(148, 1, 'IV', 'major', NULL, NULL),
(148, 2, 'III', 'dominant', '7', NULL),
(148, 3, 'vi', 'minor', NULL, NULL),
(148, 4, 'IV', 'major', NULL, NULL);

-- 149. viiø - III7 - vi - IV (단조 차용 비장한 J-Rock 브릿지)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (149, 'viiø - III7 - vi - IV (단조 차용 비장한 J-Rock 브릿지)', '["Bridge"]', '평행단조의 2-5를 차용해 비장미를 한껏 끌어올린 뒤 4도로 안착하여 코러스의 폭발을 준비하는 브릿지 전용 진행', 85, 88, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(149, 1, 'vii°', 'half-diminished', 'm7b5', NULL),
(149, 2, 'III', 'dominant', '7', NULL),
(149, 3, 'vi', 'minor', NULL, NULL),
(149, 4, 'IV', 'major', NULL, NULL);

-- 150. IV - I/3 - IV - V (스피츠풍 아르페지오 록 프리코러스)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (150, 'IV - I/3 - IV - V (스피츠풍 아르페지오 록 프리코러스)', '["Pre-Chorus", "Verse"]', '4도와 1도의 3음 베이스(C/E)를 교차하며 서정성을 잔잔히 채운 뒤 5도 도미넌트로 시원하게 쏘아 올리는 진행', 88, 92, 'subdominant_start', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(150, 1, 'IV', 'major', NULL, NULL),
(150, 2, 'I', 'major', NULL, '3'),
(150, 3, 'IV', 'major', NULL, NULL),
(150, 4, 'V', 'major', NULL, NULL);

-- 151. bVII - I - bVII - I (모던 록/메탈 기타 리프 뱀프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (151, 'bVII - I - bVII - I (모던 록/메탈 기타 리프 뱀프)', '["Intro", "Interlude"]', '디스토션 기타의 헤비한 파워코드 리프와 찰떡궁합을 이루는 믹솔리디안 기반의 인트로/간주 리프 뱀프', 83, 86, 'modal_interchange', 7, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(151, 1, 'bVII', 'major', NULL, NULL),
(151, 2, 'I', 'major', NULL, NULL),
(151, 3, 'bVII', 'major', NULL, NULL),
(151, 4, 'I', 'major', NULL, NULL);

-- 152. IV - III7 - vi - IV (세컨더리 도미넌트 왕도 4도 순환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (152, 'IV - III7 - vi - IV (세컨더리 도미넌트 왕도 4도 순환)', '["Chorus", "Pre-Chorus"]', 'III7으로 감정선을 당긴 후 6도를 거쳐 4도로 루프를 완성하는 감성 록 밴드들의 트레이드마크 진행', 91, 90, 'secondary_dominant', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(152, 1, 'IV', 'major', NULL, NULL),
(152, 2, 'III', 'dominant', '7', NULL),
(152, 3, 'vi', 'minor', NULL, NULL),
(152, 4, 'IV', 'major', NULL, NULL);

-- 153. vi - bVII - I - I (모달 차용 마이너-메이저 승리감 해결)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (153, 'vi - bVII - I - I (모달 차용 마이너-메이저 승리감 해결)', '["Chorus", "Outro"]', '마이너의 고난에서 bVII를 거쳐 1도로 환하게 해소되는 드라마틱한 승리와 환희의 엔딩 진행', 86, 89, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(153, 1, 'vi', 'minor', NULL, NULL),
(153, 2, 'bVII', 'major', NULL, NULL),
(153, 3, 'I', 'major', NULL, NULL),
(153, 4, 'I', 'major', NULL, NULL);

-- 154. I - bVII - IV - IV (재패니즈 록 앤섬 진행)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (154, 'I - bVII - IV - IV (재패니즈 록 앤섬 진행)', '["Chorus", "Outro"]', '스타디움 록과 펑크 록의 떼창을 유도하는 시원하고 거침없는 4도 서스테인 믹솔리디안 진행', 87, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(154, 1, 'I', 'major', NULL, NULL),
(154, 2, 'bVII', 'major', NULL, NULL),
(154, 3, 'IV', 'major', NULL, NULL),
(154, 4, 'IV', 'major', NULL, NULL);

-- 155. IV - V - #Vdim - vi (상행 디미니시 마이너 직행 텐션)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (155, 'IV - V - #Vdim - vi (상행 디미니시 마이너 직행 텐션)', '["Pre-Chorus", "Bridge"]', '4-5도 진행 후 #Vdim을 경유하여 vi 마이너로 강력하게 빨려 들어가는 긴장과 스릴의 애니송 빌드업', 90, 94, 'passing_diminished', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(155, 1, 'IV', 'major', NULL, NULL),
(155, 2, 'V', 'major', NULL, NULL),
(155, 3, '#V', 'diminished', NULL, NULL),
(155, 4, 'vi', 'minor', NULL, NULL);

-- 156. vi - ii - V - III7 (코무로 마이너 2-5 후 세컨더리 도미넌트)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (156, 'vi - ii - V - III7 (코무로 마이너 2-5 후 세컨더리 도미넌트)', '["Verse", "Interlude"]', '단조 분위기의 2-5 진행 뒤 III7(V/vi)을 붙여 쉼 없이 다음 마디로 달려가게 만드는 고속 록 턴어라운드', 87, 93, 'secondary_dominant', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(156, 1, 'vi', 'minor', NULL, NULL),
(156, 2, 'ii', 'minor', NULL, NULL),
(156, 3, 'V', 'major', NULL, NULL),
(156, 4, 'III', 'dominant', '7', NULL);

-- 157. IVmaj7 - V7 - vi7 - vi7 (감성 질주 록 사비 페달)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (157, 'IVmaj7 - V7 - vi7 - vi7 (감성 질주 록 사비 페달)', '["Chorus"]', '후렴의 문을 활짝 열고 vi7에서 2마디 동안 감정을 쏟아붓는 보컬 멜로디 강조형 모던 J-Rock 진행', 92, 89, 'royal_road', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(157, 1, 'IV', 'major', 'maj7', NULL),
(157, 2, 'V', 'dominant', '7', NULL),
(157, 3, 'vi', 'minor', '7', NULL),
(157, 4, 'vi', 'minor', '7', NULL);

-- 158. I - V - bVII - IV (클래식 하드록/J-Rock 리프 순환)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (158, 'I - V - bVII - IV (클래식 하드록/J-Rock 리프 순환)', '["Verse", "Intro"]', '파워코드 리프와 질주하는 드럼 비트에 최적화된 스트레이트하고 호쾌한 록앤롤 진행', 86, 88, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(158, 1, 'I', 'major', NULL, NULL),
(158, 2, 'V', 'major', NULL, NULL),
(158, 3, 'bVII', 'major', NULL, NULL),
(158, 4, 'IV', 'major', NULL, NULL);

-- 159. IV - iv - I - #IVø (재지 서브도미넌트 마이너 + 하프디미니시)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (159, 'IV - iv - I - #IVø (재지 서브도미넌트 마이너 + 하프디미니시)', '["Bridge", "Interlude"]', 'iv 모달 인터체인지와 #IVø의 정교한 텐션 배합으로 도회적이고 몽환적인 감성을 연출하는 시티록 브릿지', 84, 87, 'modal_interchange', 8, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(159, 1, 'IV', 'major', NULL, NULL),
(159, 2, 'iv', 'minor', NULL, NULL),
(159, 3, 'I', 'major', NULL, NULL),
(159, 4, '#IV', 'half-diminished', 'm7b5', NULL);

-- 160. bVI - bVII - I - IV (보컬로이드 사비 4도 오픈 루프)
INSERT INTO system_recommendation_progressions (id, name, form_tags, description, popularity_score, connectivity_score, diversity_group, priority, created_at)
VALUES (160, 'bVI - bVII - I - IV (보컬로이드 사비 4도 오픈 루프)', '["Chorus"]', '마리오 카덴스로 1도에 도달한 후 4도로 시원하게 공간을 열며 후렴의 다음 소절로 달리는 쾌속 진행', 89, 91, 'vocaloid_speed', 9, datetime('now'));
INSERT INTO system_progression_steps (progression_id, position, degree, quality, extension, bass_degree) VALUES
(160, 1, 'bVI', 'major', NULL, NULL),
(160, 2, 'bVII', 'major', NULL, NULL),
(160, 3, 'I', 'major', NULL, NULL),
(160, 4, 'IV', 'major', NULL, NULL);
