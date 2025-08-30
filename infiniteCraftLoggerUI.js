// ==UserScript==
// @name         Infinite Craft API Logger
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Log all unique parameters from API requests and responses in Infinite Craft game
// @author       Askas-db
// @match        https://neal.fun/infinite-craft/
// @icon         https://neal.fun/favicons/infinite-craft.png
// @grant        none
// @connect      neal.fun
// ==/UserScript==

(function() {
    'use strict';
    const originalFetch = window.fetch;
    const parameterLog = [];
    // Floating UI
    const createUI = () => {
        const ui = document.createElement('div');
        ui.id = 'infiniteCraftLoggerUI';
        ui.style.position = 'fixed';
        ui.style.top = '250px';
        ui.style.left = '20px';
        ui.style.zIndex = '9999';
        ui.style.width = '300px';
        ui.style.height = '400px';
        ui.style.backgroundColor = 'white';
        ui.style.border = '1px solid #ccc';
        ui.style.borderRadius = '5px';
        ui.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
        ui.style.resize = 'both';
        ui.style.overflow = 'hidden';
        ui.style.fontFamily = 'Arial, sans-serif';

        const label = document.createElement('div');
        label.id = 'infiniteCraftLoggerLabel';
        label.style.padding = '10px';
        label.style.backgroundColor = '#f0f0f0';
        label.style.cursor = 'move';
        label.style.fontWeight = 'bold';
        label.style.userSelect = 'none';
        label.textContent = 'Infinite Craft - Log';

        const content = document.createElement('textarea');
        content.id = 'infiniteCraftLoggerContent';
        content.style.width = '100%';
        content.style.height = 'calc(100% - 80px)';
        content.style.padding = '10px';
        content.style.boxSizing = 'border-box';
        content.style.border = 'none';
        content.style.resize = 'none';
        content.style.outline = 'none';
        content.style.overflowY = 'auto';

        const buttonBar = document.createElement('div');
        buttonBar.style.padding = '5px 10px';
        buttonBar.style.backgroundColor = '#f0f0f0';
        buttonBar.style.display = 'flex';
        buttonBar.style.justifyContent = 'flex-end';
        buttonBar.style.gap = '5px';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.style.padding = '3px 8px';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.padding = '3px 8px';

        const loadButton = document.createElement('button');
        loadButton.textContent = 'Load';
        loadButton.style.padding = '3px 8px';

        buttonBar.appendChild(copyButton);
        buttonBar.appendChild(saveButton);
        buttonBar.appendChild(loadButton);

        ui.appendChild(label);
        ui.appendChild(content);
        ui.appendChild(buttonBar);

        document.body.appendChild(ui);

        // Draggable
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        label.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            ui.style.top = (ui.offsetTop - pos2) + 'px';
            ui.style.left = (ui.offsetLeft - pos1) + 'px';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        copyButton.onclick = () => {
            content.select();
            document.execCommand('copy');
        };

        saveButton.onclick = () => {
            const dataStr = JSON.stringify(parameterLog, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            const exportFileDefaultName = 'infinite-craft-log.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };

        loadButton.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loadedLog = JSON.parse(event.target.result);
                        parameterLog.length = 0; // Clear current log
                        parameterLog.push(...loadedLog);
                        content.value = parameterLog.map(entry =>
                            `${entry.parameter1} + ${entry.parameter2} → ${entry.result}`
                        ).join('\n');
                    } catch (error) {
                        console.error('Error loading file:', error);
                        alert('Error loading file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };

        return { ui, content };
    };

    const { ui, content } = createUI();

    // Override the global fetch function
    window.fetch = async function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('https://neal.fun/api/infinite-craft/pair')) {
            const url = new URL(args[0]);
            const firstParameter = url.searchParams.get('first');
            const secondParameter = url.searchParams.get('second');
            // Recall the original
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();
            try {
                // Check JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await clonedResponse.json();
                    const { result, emoji, isNew } = data;
                    // Check response
                    const responseExists = parameterLog.some(entry =>
                        entry.parameter1 === firstParameter &&
                        entry.parameter2 === secondParameter &&
                        entry.result === result
                    );
                    if (!responseExists) {
                        const logEntry = {
                            parameter1: firstParameter,
                            parameter2: secondParameter,
                            result: result,
                            emoji: emoji,
                            isNew: isNew,
                            timestamp: new Date().toISOString()
                        };
                        parameterLog.push(logEntry);
                        // Update UI
                        content.value = parameterLog.map(entry =>
                            `${entry.parameter1} + ${entry.parameter2} → ${entry.result}`
                        ).join('\n');
                        console.log('Parameter Log:', parameterLog);
                    }
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
            return response;
        }

        return originalFetch.apply(this, args);
    };
})();
