const $ = document.querySelector.bind(document);

const button = $("button");
const qrcodeInput = $("#qrcode");
const merchantContent = $(".merchant-content");

const keys = {
  "00": "Versão dos dados",
  "01": "Identificador do método QRCode gerado",
  '26.01': 'Número do estabelecimento comercial',
  '26.02': 'Terminal Logical Number',
  52: "Código da Categoria do Merchant",
  53: "Código da Moeda",
  54: "Valor da transação",
  58: "Código do País",
  59: "Nome do merchant",
  60: "Cidade do Merchant",
  63: 'CRC',
  "81.00": "Identificador global",
  '81.01': 'Data e hora da transação',
  '81.02': 'Creditor Number',
  '81.06': 'Id da transação'
};

button.addEventListener("click", () => {
  const qrCode = qrcodeInput.value;
  if (!qrCode) return;

  const content = convert(qrCode, 0, {}, {}, false);

  merchantContent.innerHTML = "";

  const parsedQrCode = Object.keys(keys)
    .map((key) => {
      if (key.split(".").length > 1) {
        const [firstKey, secondKey] = key.split(".");
        return {
            label: keys[key],
            value: content[firstKey][secondKey]
        };
      }

      return {
        value: content[key],
        label: keys[key],
      };
    })
    .reduce((accum, item) => [...accum, item], []);

  parsedQrCode.forEach((item) => {
    merchantContent.appendChild(createItem(item));
  });
});

function createItem(item) {
  const article = document.createElement("article");
  const label = document.createElement("label");
  const value = document.createElement("value");

  label.classList.add("label");
  value.classList.add("value");

  label.innerHTML = item.label;
  value.innerHTML = item.value;

  article.appendChild(label);
  article.appendChild(value);
  return article;
}

function convert(qrCode, offSet, hashTag, hashTemplate, isTemplate) {
  if (qrCode.length == offSet) return hashTag;

  let objectId = qrCode.substring(offSet, offSet + 2);

  offSet += 2;
  let length = parseInt(
    qrCode.substring(offSet, "80" == objectId ? offSet + 3 : offSet + 2)
  );
  offSet += "80" == objectId ? 3 : 2;

  let content = qrCode.substring(offSet, offSet + length);

  if (["26", "80", "81", "62"].includes(objectId)) {
    hashTemplate = convertSpecialContent(content, 0, {});
    isTemplate = true;
  }

  offSet += length;

  hashTag[objectId] = isTemplate ? hashTemplate : content;

  return convert(qrCode, offSet, hashTag, hashTemplate, false);
}

function convertSpecialContent(qrCode, offSet, map) {
  if (qrCode.length == offSet) return map;

  let objectId = qrCode.substring(offSet, offSet + 2);

  offSet += 2;
  let length = parseInt(qrCode.substring(offSet, offSet + 2));
  offSet += 2;
  let value = qrCode.substring(offSet, offSet + length);

  offSet += length;

  map[objectId] = value;

  return convertSpecialContent(qrCode, offSet, map);
}
