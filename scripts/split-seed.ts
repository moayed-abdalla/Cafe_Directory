import fs from "fs";
import path from "path";

const cafesSql = fs.readFileSync(
  path.join(process.cwd(), "data", "seed-cafes.sql"),
  "utf-8"
);
const insertOnly = cafesSql
  .replace(/^[\s\S]*?insert into public.cafes/, "insert into public.cafes")
  .trim();

const valuesStart = insertOnly.indexOf("values") + "values".length;
const header = insertOnly.slice(0, valuesStart);
const valuesBody = insertOnly.slice(valuesStart).trim();

const rows = valuesBody
  .split(/\),\s*\(/)
  .map((chunk, i, arr) => {
    let row = chunk.trim();
    if (i === 0) row = row.replace(/^\(/, "");
    if (i === arr.length - 1) row = row.replace(/\);?\s*$/, "");
    return `(${row})`;
  });

const chunkSize = 12;
for (let i = 0; i < rows.length; i += chunkSize) {
  const chunk = rows.slice(i, i + chunkSize);
  const sql = `${header}\n${chunk.join(",\n")};`;
  fs.writeFileSync(
    path.join(process.cwd(), "data", `seed-cafes-chunk-${i / chunkSize}.sql`),
    sql
  );
}

console.log(`Split into ${Math.ceil(rows.length / chunkSize)} chunks`);
