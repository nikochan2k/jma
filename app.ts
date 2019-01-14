import puppeteer from "puppeteer";

const parseKansokujo = () => {
  try {
    const toInt = (td: HTMLElement) => {
      const i = parseInt(td.innerText);
      return isNaN(i) ? null : i;
    };
    const toFloat = (td: HTMLElement) => {
      const d = parseFloat(td.innerText);
      return isNaN(d) ? null : d;
    };
    const directions: { [key: string]: number } = {
      "北": 360.0 * 0 / 16, "北北東": 360.0 * 1 / 16, "北東": 360.0 * 2 / 16, "東北東": 360.0 * 3 / 16,
      "東": 360.0 * 4 / 16, "東南東": 360.0 * 5 / 16, "南東": 360.0 * 6 / 16, "南南東": 360.0 * 7 / 16,
      "南": 360.0 * 8 / 16, "南南西": 360.0 * 9 / 16, "南西": 360.0 * 10 / 16, "西南西": 360.0 * 11 / 16,
      "西": 360.0 * 12 / 16, "西北西": 360.0 * 13 / 16, "北西": 360.0 * 14 / 16, "北北西": 360.0 * 15 / 16,
    }
    const toBearing = (td: HTMLElement) => {
      const direction = td.innerText.trim();
      return directions[direction];
    }

    const trs = document.querySelectorAll("#tablefix1 tr");
    const rows = [];
    for (let row = 0; row < trs.length; row++) {
      if (row < 2) {
        continue;
      }
      const tds = trs[row].querySelectorAll("td");
      const cols = [];
      for (let col = 0; col < tds.length; col++) {
        switch (col) {
          case 0: // 時
          case 7: // 湿度(％)
          case 12: // 雪(cm) - 降雪
          case 13: // 雪(cm) - 積雪
            cols.push(toInt(tds[col]));
            break;
          case 1: // 気圧(hPa) - 現地
          case 2: // 気圧(hPa) - 海面
          case 3: // 降水量(mm)
          case 4: // 気温(℃)
          case 5: // 露点温度(℃)
          case 6: // 蒸気圧(hPa)
          case 8: // 風速
          case 10: // 日照時間(h)
          case 11: // 全天日射量(MJ/㎡)
          case 16: // 視程(km)
            cols.push(toFloat(tds[col]));
            break;
          case 9: // 風向
            cols.push(toBearing(tds[col]));
            break;
          case 14: // 天気
            const image = <HTMLImageElement>tds[col].querySelector("img");
            cols.push(image ? image.getAttribute("alt") : null);
            break;
          case 15: // 雲量
            const unryo = tds[col].innerText;
            cols.push(unryo || null);
            break;
        }
      }
      rows.push(cols);
    }
    return rows;
  } catch (e) {
    return e;
  }
}

const parseAmedas = () => {
  const toInt = (td: HTMLElement) => {
    const i = parseInt(td.innerText);
    return isNaN(i) ? null : i;
  };
  const toFloat = (td: HTMLElement) => {
    const d = parseFloat(td.innerText);
    return isNaN(d) ? null : d;
  };
  const directions: { [key: string]: number } = {
    "北": 360.0 * 0 / 16, "北北東": 360.0 * 1 / 16, "北東": 360.0 * 2 / 16, "東北東": 360.0 * 3 / 16,
    "東": 360.0 * 4 / 16, "東南東": 360.0 * 5 / 16, "南東": 360.0 * 6 / 16, "南南東": 360.0 * 7 / 16,
    "南": 360.0 * 8 / 16, "南南西": 360.0 * 9 / 16, "南西": 360.0 * 10 / 16, "西南西": 360.0 * 11 / 16,
    "西": 360.0 * 12 / 16, "西北西": 360.0 * 13 / 16, "北西": 360.0 * 14 / 16, "北北西": 360.0 * 15 / 16,
  }
  const toBearing = (td: HTMLElement) => {
    const direction = td.innerText.trim();
    return directions[direction];
  }

  const trs = document.querySelectorAll("#tablefix1 tr");
  const rows = [];
  for (let row = 0; row < trs.length; row++) {
    if (row < 2) {
      continue;
    }
    const tds = trs[row].querySelectorAll("td");
    const cols = [];
    for (let col = 0; col < tds.length; col++) {
      switch (col) {
        case 0: // 時
          cols[0] = toInt(tds[col]);
          break;
        case 1: // 降水量(mm)
          cols[3] = toFloat(tds[col]);
          break;
        case 2: // 気温(℃)
          cols[4] = toFloat(tds[col]);
          break;
        case 3: // 風速
          cols[8] = toFloat(tds[col]);
          break;
        case 4: // 風向
          cols[9] = toBearing(tds[col]);
          break;
        case 5: // 日照時間(h)
          cols[10] = toFloat(tds[col]);
          break;
        case 6: // 雪(cm) - 降雪
          cols[12] = toInt(tds[col]);
          break;
        case 7: // 雪(cm) - 積雪
          cols[13] = toInt(tds[col]);
          break;
      }
    }
    cols[1] = cols[2] = cols[5] = cols[6] = cols[7] = cols[11] = cols[14] = cols[15] = cols[16] = null;
    rows.push(cols);
  }
  return rows;
}

const prec_no = "46"; // "46"; "54";
const block_no = "47670" // "47670"; "0529";
const year = "2018";
const month = "12";
const day = "01";
const kansokujo = 10000 <= parseInt(block_no);

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = kansokujo ?
    `http://www.data.jma.go.jp/obd/stats/etrn/view/hourly_s1.php?prec_no=${prec_no}&block_no=${block_no}&year=${year}&month=${month}&day=${day}&view=p1`
    :
    `http://www.data.jma.go.jp/obd/stats/etrn/view/hourly_a1.php?prec_no=${prec_no}&block_no=${block_no}&year=${year}&month=${month}&day=${day}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const data = kansokujo ? await page.evaluate(parseKansokujo) : await page.evaluate(parseAmedas);
  (<Array<Object>>data).forEach((cols) => {
    const row = (<Array<Object>>cols).join(",");
    console.log(row);
  })
  await browser.close();
})();
