const HISTORY_LIMIT = 5;
const history = [];

$(function () {
    const $firstNumberInput = $("#a");
    const $secondNumberInput = $("#b");
    const $operationSelect = $("#op");
    const $calculateButton = $("#btn");
    const $resultLines = $("#resultLines");

    function parseInputValue(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return { ok: false, value: 0 };
        }

        return { ok: true, value: number };
    }

    function formatNumber(number) {
        if (Object.is(number, -0)) {
            number = 0;
        }

        return Number(number.toFixed(12)).toString();
    }

    function renderHistory() {
        if (!history.length) {
            $resultLines.html('<div class="line line--now">—</div>');
            return;
        }

        $resultLines.html(
            history
                .map((entry, index) => {
                    const lineClass = index === history.length - 1 ? "line--now" : "line--old";
                    return `<div class="line ${lineClass}">${entry}</div>`;
                })
                .join("")
        );
    }

    function validateForm() {
        const firstNumber = parseInputValue($firstNumberInput.val());
        const secondNumber = parseInputValue($secondNumberInput.val());
        const operation = $operationSelect.val();

        const canCalculate =
            firstNumber.ok &&
            secondNumber.ok &&
            !(operation === "/" && secondNumber.value === 0);

        $calculateButton.prop("disabled", !canCalculate);

        return canCalculate;
    }

    function computeResult() {
        if (!validateForm()) {
            return;
        }

        const firstNumber = parseInputValue($firstNumberInput.val());
        const secondNumber = parseInputValue($secondNumberInput.val());
        const operation = $operationSelect.val();

        let result = 0;

        switch (operation) {
            case "+":
                result = firstNumber.value + secondNumber.value;
                break;
            case "-":
                result = firstNumber.value - secondNumber.value;
                break;
            case "*":
                result = firstNumber.value * secondNumber.value;
                break;
            case "/":
                result = firstNumber.value / secondNumber.value;
                break;
        }

        const line = `${formatNumber(firstNumber.value)} ${operation} ${formatNumber(secondNumber.value)} = ${formatNumber(result)}`;

        history.push(line);

        if (history.length > HISTORY_LIMIT) {
            history.splice(0, history.length - HISTORY_LIMIT);
        }

        renderHistory();
    }

    $firstNumberInput.on("input", validateForm);
    $secondNumberInput.on("input", validateForm);
    $operationSelect.on("change", validateForm);

    $calculateButton.on("click", computeResult);

    $firstNumberInput.add($secondNumberInput).on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            computeResult();
        }
    });

    renderHistory();
    validateForm();
});
