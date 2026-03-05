$(function () {
  const $a = $("#a");
  const $b = $("#b");
  const $op = $("#op");
  const $btn = $("#btn");
  const $resultLines = $("#resultLines");

  const LIMIT = 5;
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
    if (!s) return { ok: false };
    if (!isValidNumberString(s)) return { ok: false };
    const n = Number(s);
    if (!Number.isFinite(n)) return { ok: false };
    return { ok: true, value: n, norm: s };
  }

  function formatNumber(n) {
    if (Object.is(n, -0)) n = 0;
    return (Math.round(n * 1e12) / 1e12).toString();
  }

  function render() {
    if (!history.length) {
      $resultLines.html(`<div class="line line--now">—</div>`);
      return;
    }

    $resultLines.html(
      history.map((h, i) => {
        const cls = (i === history.length - 1) ? "line--now" : "line--old";
        return `<div class="line ${cls}">${h}</div>`;
      }).join("")
    );
  }

  function validate() {
    const pa = parseNumber($a.val());
    const pb = parseNumber($b.val());
    const op = $op.val();

    const can = pa.ok && pb.ok && !(op === "/" && pb.value === 0);
    $btn.prop("disabled", !can);
    return can;
  }

  function compute() {
    if (!validate()) return;

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

    const line = `${pa.norm} ${op} ${pb.norm} = ${formatNumber(r)}`;

    history.push(line);
    if (history.length > LIMIT) history.splice(0, history.length - LIMIT);

    render();
  }

  $a.on("input", validate);
  $b.on("input", validate);
  $op.on("change", validate);

  $btn.on("click", compute);

  $a.add($b).on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      compute();
    }
  });

  render();
  validate();
});