import Papa from 'papaparse';

interface CsvRow {
  [key: string]: string;
}

export async function loadCsvData(filePath: string): Promise<CsvRow[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            console.error('CSV parsing errors:', results.errors);
            reject(new Error('Failed to parse CSV.'));
          } else {
            resolve(results.data as CsvRow[]);
          }
        },
        error: (err: Error) => {
          reject(err);
        },
      });
    });
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}