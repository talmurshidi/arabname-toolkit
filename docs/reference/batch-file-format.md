# Batch file format (CSV/TSV)

Reference for the file format accepted by the Batch page (`src/ui/pages/BatchPage.tsx`)
and `processCsvFile()`/`previewCsvFile()` in `src/services/BatchService.ts`.

## Basics

- Accepted extensions: `.csv`, `.tsv` (any single-character delimiter Papa Parse can
  auto-detect also works — comma and tab are the common cases).
- One column contains the Latin name to convert; other columns are ignored.
- The column can be selected by **0-based index** or, if the file has a header row, by
  **name** (case-insensitive, whitespace-trimmed).
- Empty cells in the selected column are skipped by default (`skipEmpty: true`).

## `hasHeader` — read this before processing a headerless file

`hasHeader` defaults to `true`: the first row is treated as a header and excluded from
processing. If your file does **not** have a header row, you **must** pass
`hasHeader: false` (or uncheck "This file has a header row" in the Batch page UI) —
otherwise your first data row is silently discarded, having been mistaken for a header.

A named `column` (e.g. `column: 'name'`) requires `hasHeader: true`, since there's no
header row to match the name against otherwise; passing a string column with
`hasHeader: false` is rejected with an error rather than guessing.

## Example: file with a header row (default, `hasHeader: true`)

```csv
id,fullname,notes
1,Abū Bakr,
2,ʿUmar Ibn al-Khaṭṭāb,second caliph
3,ʿAlī Ibn Abī Ṭālib,
```

Selecting the name column by name:

```ts
processCsvFile(file, { column: 'fullname' }); // hasHeader defaults to true
```

Selecting it by index (0-based — `fullname` is column 1 here):

```ts
processCsvFile(file, { column: 1 });
```

## Example: headerless file

```csv
Abū Bakr
ʿUmar Ibn al-Khaṭṭāb
ʿAlī Ibn Abī Ṭālib
```

```ts
processCsvFile(file, { hasHeader: false }); // column defaults to 0
```

Omitting `hasHeader: false` here would treat `"Abū Bakr"` as a header row and silently
drop it — only `ʿUmar` and `ʿAlī` would be processed.

## Example: tab-separated (TSV), multi-column, headerless

```tsv
Abū Bakr	al-Ṣiddīq	1st caliph
ʿUmar	al-Fārūq	2nd caliph
```

```ts
processCsvFile(file, { hasHeader: false, column: 0 }); // delimiter auto-detected as tab
```

## Preview and validation before processing

Call `previewCsvFile(file, { column, hasHeader })` to get, without processing anything:

- `headerRow` (or `null` if `hasHeader: false`)
- `sampleRows` — first 5 data rows
- `columnIndex` — the resolved 0-based column index
- `totalDataRows` — total data-row count (post-header)
- `warnings` — see below

| Warning code             | Meaning                                                                                                                                       | Blocking?               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `empty-file`             | The file has no rows at all.                                                                                                                  | Yes                     |
| `no-data-rows`           | Only a header row was found (or the file is empty with `hasHeader: false`).                                                                   | Yes                     |
| `column-not-found`       | A named `column` wasn't found in the header row.                                                                                              | Yes                     |
| `column-out-of-range`    | The numeric `column` index exceeds the file's actual column count.                                                                            | Yes                     |
| `single-column-detected` | Only one column was detected across the file — often means the wrong delimiter was picked, but a genuinely single-column file is valid input. | No (informational only) |

The Batch page UI calls `previewCsvFile()` automatically whenever the file, column, or
`hasHeader` selection changes, shows the preview table and any warnings, and disables the
"Start processing" button while a blocking warning is present.

## Output format (`exportReportToCsv`)

```csv
row,input,arabic_harakat,arabic,name_order,status,error
1,"Abū Bakr","أَبُو بَكْر","ابو بكر","Abu Bakr",ok,
2,"","","","",skipped,"empty cell"
3,"bad input","","","",error,"<error message>"
```
