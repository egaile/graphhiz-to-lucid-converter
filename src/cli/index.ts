#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { promises as fs } from 'fs';
import path from 'path';
import glob from 'fast-glob';
import { parseAndLayoutDot } from '../graph/parseAndLayout';
import { exportToDrawIo } from '../export/drawio';
import { exportToLucid, createLucidZip } from '../export/lucid';

interface CLIArguments {
  in: string[];
  'out-format': 'drawio' | 'lucid';
  out: string;
  verbose?: boolean;
}

const argv = yargs(hideBin(process.argv))
  .command(
    '$0',
    'Convert Graphviz DOT files to Lucidchart-compatible formats',
    (yargs) => {
      return yargs
        .option('in', {
          describe: 'Input DOT file(s) or glob pattern',
          type: 'array',
          string: true,
          demandOption: true,
          coerce: (arg: string[]) => arg.flatMap(a => a.split(' ')),
        })
        .option('out-format', {
          describe: 'Output format',
          choices: ['drawio', 'lucid'] as const,
          default: 'drawio' as const,
        })
        .option('out', {
          describe: 'Output directory',
          type: 'string',
          default: './out',
        })
        .option('verbose', {
          describe: 'Enable verbose output',
          type: 'boolean',
          default: false,
        })
        .example(
          '$0 --in "*.dot" --out-format drawio --out ./output',
          'Convert all DOT files to draw.io format'
        )
        .example(
          '$0 --in diagram.dot --out-format lucid --out ./output',
          'Convert single file to Lucid format'
        );
    }
  )
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parseSync() as unknown as CLIArguments;

async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
}

async function findFiles(patterns: string[]): Promise<string[]> {
  const files: string[] = [];
  
  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      const matches = await glob(pattern, {
        absolute: true,
        onlyFiles: true,
      });
      files.push(...matches);
    } else {
      try {
        const stat = await fs.stat(pattern);
        if (stat.isFile()) {
          files.push(path.resolve(pattern));
        }
      } catch (error) {
        console.warn(`File not found: ${pattern}`);
      }
    }
  }
  
  return files.filter(file => file.endsWith('.dot') || file.endsWith('.gv'));
}

async function processFile(
  inputPath: string,
  outputDir: string,
  format: 'drawio' | 'lucid',
  verbose: boolean
): Promise<void> {
  const fileName = path.basename(inputPath);
  const baseName = fileName.replace(/\.(dot|gv)$/i, '');
  
  if (verbose) {
    console.log(`Processing: ${fileName}`);
  }
  
  try {
    const content = await fs.readFile(inputPath, 'utf-8');
    const graph = await parseAndLayoutDot(content);
    
    if (format === 'drawio') {
      const xml = exportToDrawIo(graph);
      const outputPath = path.join(outputDir, `${baseName}.drawio`);
      await fs.writeFile(outputPath, xml);
      
      if (verbose) {
        console.log(`  ✓ Exported to: ${outputPath}`);
      }
    } else {
      const lucidDoc = exportToLucid(graph);
      const blob = await createLucidZip(lucidDoc);
      const buffer = Buffer.from(await blob.arrayBuffer());
      const outputPath = path.join(outputDir, `${baseName}.lucid`);
      await fs.writeFile(outputPath, buffer);
      
      if (verbose) {
        console.log(`  ✓ Exported to: ${outputPath}`);
      }
    }
  } catch (error) {
    console.error(`  ✗ Failed to process ${fileName}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function main(): Promise<void> {
  const { in: inputPatterns, 'out-format': format, out: outputDir, verbose } = argv;
  
  console.log('Graphviz to Lucidchart Converter');
  console.log('---------------------------------');
  
  try {
    await ensureDirectory(outputDir);
    
    const files = await findFiles(inputPatterns);
    
    if (files.length === 0) {
      console.error('No DOT files found matching the input patterns');
      process.exit(1);
    }
    
    console.log(`Found ${files.length} file(s) to process`);
    console.log(`Output format: ${format}`);
    console.log(`Output directory: ${outputDir}`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        await processFile(file, outputDir, format, verbose || false);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    console.log('');
    console.log(`Conversion complete: ${successCount} succeeded, ${errorCount} failed`);
    
    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});