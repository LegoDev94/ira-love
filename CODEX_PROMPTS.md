# Задание для Codex: графика для сайта «Разворот»

Ты рисуешь графику для готового сайта-сюрприза (папка `C:\PROJECTS\IraLove`). Код сайта **не трогай**:
он уже ссылается на файлы по точным путям ниже. Если файла нет, сайт показывает заглушку, так что
каждая новая картинка сразу улучшает сайт.

## Порядок работы

1. Прочитай раздел «Стиль» и «Персонажи». Это библия стиля, все картинки должны выглядеть как кадры **одного** мультфильма.
2. Сначала сделай листы персонажей (шаг 0) и дальше используй их как референс в каждом промпте с людьми.
3. Генерируй строго по списку. **Сохраняй PNG в `_raw/...` с точно таким именем, как указано.**
   - Где написано `TRANSPARENT`, нужен PNG с прозрачным фоном (background: transparent): без земли, теней-плашек и рамок.
   - Размеры: `L` = 1536×1024 (горизонталь), `P` = 1024×1536 (вертикаль), `S` = 1024×1024.
4. Когда всё готово, запусти: `python tools/optimize.py`. Скрипт сожмёт PNG в WebP и разложит их в `assets/...`.
5. Проверь локально: `python -m http.server 8765`, открой http://localhost:8765, нажми «Открыть» и пролистай до конца.
6. Задеплой: `git add -A && git commit -m "Add illustrations" && git push`. GitHub Pages обновится примерно за минуту.

> Папки `_raw/` и `_refs/` в git не попадают (это исходники и личные фото).

---

## Стиль (добавляй в КАЖДЫЙ промпт)

```
STYLE: cinematic 2D illustration, a frame from a high-end hand-painted animated feature film.
Painterly digital painting, soft volumetric light, gentle film grain, rich cinematic color grading,
semi-realistic stylized characters (not chibi, not photoreal, not 3D render), clean readable silhouettes,
emotional romantic mood. No text, no letters, no watermarks, no logos, no UI.
```

**Место действия:** молдавское село Мэркулешть (Mărculești, Florești district, Moldova). Низкие одноэтажные дома
с жестяными или черепичными крышами, крашеные заборы и металлические ворота, орех и акация, тополя вдоль дороги,
асфальт со стёртыми краями, деревянные столбы с проводами, вдали пологие поля.

**Важно для iPhone:** главный объект держи в **центральной трети** кадра. На телефоне фон обрезается по бокам.

## Персонажи

**МАШИНА ГЕРОЯ** — `dark graphite-grey modern sedan` ← *Вова: впиши сюда марку и цвет своей машины, например `white 2016 Toyota Camry`. Подставляй эту строку везде, где написано {HERO_CAR}.*

**IRA** (референс: `_refs/ira-ref.png`, бери черты лица и волосы):
```
IRA: young woman about 20, long straight platinum-blonde hair with a center part falling past the shoulders,
fair skin, soft delicate features, light eyes, gentle shy smile. Outfit: black sleeveless ribbed top with a small
polo collar and buttons, black shorts, white crew socks, chunky grey sneakers.
```

**HIM / Вова** (референс: `_refs/him-ref.jpg`):
```
HIM: man about 28, short dark brown hair, short neat dark beard, thin rectangular metal-frame glasses,
calm warm eyes, white linen shirt with open collar, dark jeans.
```

**MOM** (без фото, придумай):
```
MOM: kind woman about 47, shoulder-length dark brown hair, light summer cardigan over a simple knee-length dress, warm face.
```

---

## Шаг 0. Листы персонажей (только для консистентности, на сайт не идут)

| Файл | Размер | Промпт |
|---|---|---|
| `_raw/sheets/ira-sheet.png` | L | Character turnaround sheet of IRA: front, 3/4, side and back views, full body, neutral light grey background. Match the face and hair of the reference photo. + STYLE |
| `_raw/sheets/him-sheet.png` | L | Character turnaround sheet of HIM: front, 3/4, side and back views, full body, neutral light grey background. Match the face, beard and glasses of the reference photo. + STYLE |
| `_raw/sheets/mom-sheet.png` | L | Character turnaround sheet of MOM: front, 3/4, side views, full body, neutral light grey background. + STYLE |

---

## Шаг 1. Фоны (`_raw/bg/`)

Для каждого фона сделай **2 версии**: горизонтальную `L` и вертикальную `P` с суффиксом `-m` (для iPhone).
В вертикальной та же сцена, но кадр выстроен по вертикали: больше неба сверху, дорога внизу.
**На фонах людей и машин нет**, их сайт накладывает сам.

| Файл | Промпт |
|---|---|
| `s01-village-sunset.png` + `s01-village-sunset-m.png` | Wide establishing shot of a quiet Moldovan village street at golden hour sunset. Empty asphalt road running horizontally across the lower 20% of the frame, a narrow sidewalk strip, low colourful village houses with tin roofs, painted fences, walnut and acacia trees, tall poplars, wooden power poles with wires. Huge warm sun low on the horizon slightly right of center, sky gradient from violet to peach to gold, long shadows, dust in the air glowing. Nostalgic, the moment before something important happens. No people, no cars. + STYLE |
| `s03-road-dusk.png` + `s03-road-dusk-m.png` | Same village road a few minutes later at dusk, camera at eye level from the sidewalk, road across the lower quarter of the frame, roadside grass and a painted gate on the left, sky violet-pink with first star, warm lights turning on in one window. Calm, intimate. No people, no cars. + STYLE |
| `s05-night-village.png` + `s05-night-village-m.png` | Moldovan village at 11 pm, deep blue night, dark silhouettes of houses and trees along the bottom 25%, a single street lamp with warm glow, one lit window, the upper 70% of the frame is a clear sky with scattered stars and a faint milky way. Quiet, magical, a little bit secret. No people, no cars. + STYLE |
| `s06-gas-station.png` + `s06-gas-station-m.png` | Small roadside gas station at night on a country road in Moldova, glowing canopy lights, a tiny shop with warm windows and a coffee/tea machine visible inside, soft neon pink and cyan accents reflecting on wet asphalt, moths around the lights, dark fields behind. Cozy, cinematic, romantic. Keep the center of the frame calm (a polaroid will be placed there). No people, no cars, no readable signs. + STYLE |
| `s07-night-street.png` + `s07-night-street-m.png` | Village street at late night, dark and dramatic, a distant faint red and blue glow reflecting on houses and the road as if police lights are around the corner (no police car visible), light mist, one street lamp. Tense but slightly comedic film-noir mood. No people, no cars. + STYLE |
| `s09-storm.png` + `s09-storm-m.png` | Open field at the edge of the village under a heavy thunderstorm, dark blue-grey clouds, distant lightning, rain curtains, wind bending the grass, a lonely tree, cold desaturated palette with a tiny warm light from a far house window, sadness but hope. No people. + STYLE |
| `s10-dawn.png` + `s10-dawn-m.png` | The same field right after the storm at dawn: clouds breaking apart, golden-pink sunrise, a soft rainbow, wet grass sparkling with droplets, puddles reflecting the sky, warm and forgiving mood, a feeling of a fresh start. No people. + STYLE |
| `s12-final-sky.png` + `s12-final-sky-m.png` | Breathtaking night sky over a hill near the village: rich milky way, purple and rose nebula glow, a few fireflies over the grass in the bottom 15%, distant tiny village lights. Upper 60% must be mostly dark sky (text will be drawn there). Dreamy and romantic. No people. + STYLE |

Отдельно, слой переднего плана:

| Файл | Размер | Промпт |
|---|---|---|
| `_raw/bg/s01-foreground-grass.png` | L, TRANSPARENT | Foreground layer: a strip of tall roadside grass, wild flowers (chamomile, chicory) and dandelion seeds along the very bottom 25% of the image, backlit by golden sunset light with warm rim light, slightly out of focus (shallow depth of field). Everything above the grass is fully transparent. + STYLE |

---

## Шаг 2. Персонажи (`_raw/characters/`)

Используй листы персонажей из шага 0 как референс. Свет совпадает со сценой, в которую идёт картинка.

| Файл | Размер | Промпт |
|---|---|---|
| `ira-mom-walk.png` | L, TRANSPARENT | Full body side view of IRA and MOM walking together slowly to the RIGHT along a village road, chatting and smiling, IRA closer to the viewer. Warm golden sunset rim light from behind-right, soft shadows. Feet fully visible, nothing cropped, no ground, transparent background. + STYLE |
| `ira-mom-standing.png` | L, TRANSPARENT | Full body view of IRA and MOM standing side by side, both turned 3/4 to the RIGHT as if listening to a driver in a car, MOM pointing the way with her hand, IRA slightly shy, holding a strand of hair, curious little smile. Dusk light, pink-violet rim light. Feet visible, transparent background. + STYLE |
| `ira-portrait.png` | S | Close portrait of IRA, head and shoulders, soft genuine smile, looking at the camera, warm soft light, simple blurred pastel pink-lilac background. Used as a Telegram avatar, the face must be centered. + STYLE |
| `couple-tea.png` | P | IRA and HIM at night at a small roadside gas station, sitting on the hood of {HERO_CAR}, each holding a paper cup of hot tea with steam, IRA laughing, HIM looking at her instead of the tea, neon and canopy light, cozy and magical first-date feeling. Vertical composition, faces in the upper-middle. + STYLE |
| `couple-final.png` | S | IRA and HIM hugging under a starry night sky with the milky way, HIM gently resting his forehead on hers, eyes closed, IRA smiling, fireflies around, warm rose and violet glow. Feeling of forgiveness and deep love. + STYLE |

---

## Шаг 3. Объекты (`_raw/objects/`)

| Файл | Размер | Промпт |
|---|---|---|
| `car-side.png` | L, TRANSPARENT | {HERO_CAR}, perfect side profile view, the FRONT of the car points to the LEFT, headlights on with a soft warm glow, clean shapes, a slight warm sunset reflection on the body. The whole car is visible, wheels included, no ground and no shadow plate, transparent background. + STYLE |
| `car-top.png` | P, TRANSPARENT | {HERO_CAR} seen strictly from directly above (top-down, bird's-eye view), the FRONT points UP, small glowing headlights at the top edge, centered, the car fills about 70% of the image height, transparent background. Clean stylized illustration for a map. + STYLE |
| `audi-black.png` | L, TRANSPARENT | A black Audi sedan (A6 style), perfect side profile, the FRONT points to the RIGHT, glossy black paint, red taillights glowing, night reflections, whole car visible, no ground, transparent background. The four-ring badge may be implied but not detailed. + STYLE |
| `tea-cup.png` | S, TRANSPARENT | A single paper cup of hot tea from a gas station coffee machine, cream-white cup with a small red heart pattern band, a tea bag string and tag hanging over the rim, front view, centered, transparent background (the steam is animated by the site, do not draw it). + STYLE |
| `envelope-seal.png` | L, TRANSPARENT | A vintage cream paper love letter envelope, slightly turned, sealed with a deep red wax seal with a heart imprint, a small dried rose tucked under the seal, soft warm light, centered, transparent background. + STYLE |

---

## Шаг 4. Текстура и превью

| Файл | Размер | Промпт |
|---|---|---|
| `_raw/textures/paper.png` | P | Seamless top-down texture of warm cream handmade letter paper, subtle fibers, very faint watercolor stains in the corners, soft vignette, completely empty (handwritten text will be placed on top). Must stay light so dark text is readable. |
| `_raw/og-cover.png` | L | Cinematic movie-poster style key art: on the left IRA and MOM walking along a village road at golden sunset, on the right {HERO_CAR} making a U-turn with a glowing light trail drawing a heart shape on the road. Lots of warm sky. Keep the right-hand third of the sky empty. No text. + STYLE |

> `og-cover` — это картинка-превью, которую Telegram покажет, когда Вова отправит ссылку на сайт. Скрипт обрежет её до 1200×630.

---

## Чек-лист перед деплоем

- [ ] Все люди похожи на референсы, у Иры одинаковые волосы и одежда на всех картинках.
- [ ] `car-side` смотрит **влево**, `audi-black` **вправо**, `car-top` **вверх**. Если направление не то, отзеркаль PNG.
- [ ] Все TRANSPARENT-картинки реально с прозрачным фоном (без белого или клетчатого квадрата).
- [ ] На картинках нет текста и водяных знаков.
- [ ] `python tools/optimize.py` отработал без ошибок, в `assets/` появились `.webp`.
- [ ] Сайт проверен на телефоне в вертикальной ориентации.

---

## Шаг 5. ПЕРЕДЕЛАТЬ (по итогам проверки)

Почти всё получилось отлично. Перегенерируй только эти 3 файла и снова запусти `python tools/optimize.py`, потом закоммить и запушь.

**Что не так:** HIM нарисован качком в белой майке с надписью «BOSS». На фото он обычного телосложения,
в очках и светлой льняной рубашке. И **никакого текста на одежде**. Машина героя получилась точной копией
чёрной Audi, а в истории это две разные машины.

```
HIM (fix): man about 28 with a normal slim build (NOT muscular, NOT a bodybuilder), short dark brown hair,
short neat dark beard, thin rectangular metal-frame glasses, white long-sleeve linen shirt with rolled-up sleeves
and open collar, dark jeans. Match the face of _refs/him-ref.jpg. Absolutely no text, letters or logos on clothing.
```

| Файл | Размер | Промпт |
|---|---|---|
| `_raw/characters/couple-tea.png` | P | IRA and HIM (fix) at night at a small roadside gas station, sitting together on the hood of {HERO_CAR}, each holding a paper cup of hot tea with steam, IRA laughing, HIM looking at her instead of the tea, neon and canopy light, cozy first-date feeling. The car must NOT look like an Audi (no four-ring badge, different grille). Vertical composition, faces in the upper-middle. + STYLE |
| `_raw/characters/couple-final.png` | S | IRA and HIM (fix) hugging under a starry night sky with the milky way, HIM gently resting his forehead on hers, eyes closed, IRA smiling, fireflies around, warm rose and violet glow, feeling of forgiveness and deep love. No text anywhere. + STYLE |
| `_raw/objects/car-side.png` | L, TRANSPARENT | {HERO_CAR}, perfect side profile, FRONT points LEFT, headlights on, whole car visible, no ground, transparent background. It must clearly differ from a black Audi A6: different body shape and colour, no four-ring badge. + STYLE |
