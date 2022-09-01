# Changelog
All notable changes to this project will be documented in this file.

## [1.6.0] - 2022-09-01
- Update dependencies

### Added
- Tabbing between cells by [@cfonseca88](https://github.com/cfonseca88).
- Select all in cell by [@cfonseca88](https://github.com/cfonseca88).
- Option for selecting cells with CTRL key by [@cfonseca88](https://github.com/cfonseca88).

## [1.5.2] - 2022-08-04
### Changed
- Improve TableToolbar enabled/disabled options (updated selectors)

## [1.5.1] - 2022-07-04
### Added
- Copy table selection to clipboard (ctrl+c)

## [1.5.0] - 2022-07-01
### Changed
- Manage multiple instances of quill1-table

### Breaking Changes
- Keyboard bindings handler functions must be used as regular functions in order to pass this.quill to TableModule.keyboardHandler method (as first argument, before key name)
- Table data (containing pasted, row_counter and cell_counter) is no longer stored in quill.history.tables, stored in quill.table.tables instead
- TableSelection.isInTable moved to quill.table.isInTable (for managing multiple instances)
- TableHistory.undo and TableHistory.redo need quill instance as first argument (and change id as second argument)
- TableSelection.mouseDown, TableSelection.mouseMove, TableSelection.mouseUp and TableSelection.selectionChange need quill instance as first argument

[Unreleased]: https://github.com/dclement8/quill1-table/compare/1.6.0...HEAD
[1.6.0]: https://github.com/dclement8/quill1-table/compare/1.5.2...1.6.0
[1.5.2]: https://github.com/dclement8/quill1-table/compare/1.5.1...1.5.2
[1.5.1]: https://github.com/dclement8/quill1-table/compare/1.5.0...1.5.1
[1.5.0]: https://github.com/dclement8/quill1-table/compare/1.4.1...1.5.0