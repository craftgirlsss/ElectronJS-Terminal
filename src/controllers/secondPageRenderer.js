// secondPageRenderer.js (for second.html)
document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('commandInput');
    const executeCommandBtn = document.getElementById('executeCommandBtn');
    const outputElement = document.getElementById('output');

    executeCommandBtn.addEventListener('click', async () => {
        const command = commandInput.value.trim();
        if (!command) {
            outputElement.textContent = "Please enter a command.";
            return;
        }

        outputElement.textContent = `Executing "${command}"...`;

        try {
            // Call the function exposed by preloadSecondWindow.js
            const result = await window.terminalAPI.executeCommand(command);

            if (result.success) {
                outputElement.textContent = result.output;
            } else {
                outputElement.textContent = `Error executing command:\n${result.output}`;
            }
        } catch (error) {
            console.error("Failed to execute command:", error);
            outputElement.textContent = `An unexpected error occurred: ${error.message}`;
        }
    });

    // Optional: Allow pressing Enter in the input field
    commandInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            executeCommandBtn.click();
        }
    });
});