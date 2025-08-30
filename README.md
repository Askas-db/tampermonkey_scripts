A collection of Tampermonkey userscripts for various web applications.

---

## Infinite Craft API Logger

### Description
This script logs all unique API requests and responses from the [Infinite Craft](https://neal.fun/infinite-craft/) game. It provides a floating UI to view, copy, save, and load logged combinations and results.

### Features
- **Real-time Logging**: Captures and displays all unique combinations of `first` and `second` parameters sent to the Infinite Craft API, along with the resulting output.
- **Floating UI**: A draggable, resizable UI for easy access to the log.
- **Copy/Save/Load**: Copy logs to clipboard, save as JSON, or load previously saved logs.
- **No Duplicates**: Only logs unique combinations to avoid clutter.

### Screenshot
![Infinite Craft API Logger UI](screenshots/infiniteCraftLoggerUI.png)

### Notes
- Requires `@connect neal.fun` permission in Tampermonkey.
- Logs are saved as JSON files for easy sharing or backup.

---

## License
MIT
