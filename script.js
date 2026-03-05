$(function () {
  const $a = $("#a");
  const $b = $("#b");
  const $op = $("#op");     
  const $opBtn = $("#opBtn");
  const $btn = $("#btn");

  const $fieldA = $("#field-a");
  const $fieldB = $("#field-b");

  const $errA = $("#err-a");
  const $errB = $("#err-b");

  const $resultBox = $("#resultBox");
  const $resultLines = $("#resultLines");

  const HISTORY_LIMIT = 5;
  const history = [];

  function normalize(s) {
    return (s ?? "")
      .toString()
      .trim()
      .replace(/\s+/g, "")
      .replace(",", ".");
  }

  function isValidNumberString(s) {
    return /^[-+]?(\d+(\.\d+)?|\.\d+)$/.test(s);
  }

  function parseNumber(raw) {
    const s = normalize(raw);
    if (!s) return { ok: false, err: "Введите число" };
    if (!isValidNumberString(s)) return { ok: false, err: "Неверный формат" };
    const n = Number(s);
    if (!Number.isFinite(n)) return { ok: false, err: "Слишком большое" };
    return { ok: true, value: n, norm: s };
  }

  function formatNumber(n) {
    if (Object.is(n, -0)) n = 0;
    return (Math.round(n * 1e12) / 1e12).toString();
  }

  function shake($field) {
    $field.removeClass("shake");
    void $field[0].offsetWidth;
    $field.addClass("shake");
  }

  function setInvalid($input, $err, msg, $field) {
    $input.addClass("is-invalid");
    $err.text(msg || "");
    shake($field);
  }

  function clearInvalid($input, $err) {
    $input.removeClass("is-invalid");
    $err.text("");
  }

  function renderHistory() {
    if (!history.length) {
      $resultLines.text("—");
      return;
    }
    $resultLines.html(history.map(h => `<div class="line">${h}</div>`).join(""));
  }

  function setOp(op) {
    $op.val(op);
    const show = (op === "*") ? "×" : (op === "/") ? "÷" : (op === "-") ? "−" : "+";
    $opBtn.text(show);
  }

  function validateLive() {
    const pa = parseNumber($a.val());
    const pb = parseNumber($b.val());
    const op = $op.val();

    if (!$a.val().trim()) clearInvalid($a, $errA);
    else if (!pa.ok) setInvalid($a, $errA, pa.err, $fieldA);
    else clearInvalid($a, $errA);

    if (!$b.val().trim()) clearInvalid($b, $errB);
    else if (!pb.ok) setInvalid($b, $errB, pb.err, $fieldB);
    else clearInvalid($b, $errB);

    if (pa.ok && pb.ok && op === "/" && pb.value === 0) {
      setInvalid($b, $errB, "Деление на ноль", $fieldB);
    }

    const can = pa.ok && pb.ok && !(op === "/" && pb.ok && pb.value === 0);
    $btn.prop("disabled", !can);
    return can;
  }

  function compute() {
    if (!validateLive()) return;

    const pa = parseNumber($a.val());
    const pb = parseNumber($b.val());
    const op = $op.val();

    let r = 0;
    switch (op) {
      case "+": r = pa.value + pb.value; break;
      case "-": r = pa.value - pb.value; break;
      case "*": r = pa.value * pb.value; break;
      case "/": r = pa.value / pb.value; break;
    }

    const viewOp = (op === "*") ? "×" : (op === "/") ? "÷" : (op === "-") ? "−" : "+";
    const line = `${pa.norm} ${viewOp} ${pb.norm} = ${formatNumber(r)}`;

    history.unshift(line);
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;

    renderHistory();

    $resultBox.removeClass("pop");
    void $resultBox[0].offsetWidth;
    $resultBox.addClass("pop");
  }

  $(".calc-op-menu [data-op]").on("click", function () {
    setOp($(this).data("op"));
    validateLive();
  });

  $a.on("input", validateLive);
  $b.on("input", validateLive);
  $btn.on("click", compute);

  $a.add($b).on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      compute();
    }
  });

  setOp($op.val() || "+");
  renderHistory();
  validateLive();
});