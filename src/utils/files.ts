import { FileWithPath } from '@mantine/dropzone';
import JSZip from 'jszip';

export async function parseTestCasesZipFile(files: FileWithPath[]) {
    // The user must load only the zip containing all the test case files
    if (files.length !== 1) throw new Error('Incorrect zip file');
    const [zipFile] = files;

    const zip = new JSZip();
    // Extract file names from the zip
    const zipFiles = (await zip.loadAsync(zipFile)).files;
    const fileNames = Object.keys(zipFiles);

    // The file number must be even: for every .in file
    // there must be a related .out file
    if (fileNames.length % 2 !== 0) throw new Error('Odd number of files');

    // Check that the files has the correct names
    for (const fileName of fileNames) {
        const regex = /^case\.\d+\.in$|^case\.\d+\.out$/;
        if (!regex.test(fileName)) throw new Error('Incorrect file names');
    }

    // Sort the files by their case number
    fileNames.sort((a: string, b: string) => {
        const numberA = Number(a.split('.')[1]);
        const numberB = Number(b.split('.')[1]);

        if (numberA !== numberB) return numberA - numberB;

        if (a.endsWith('.in')) return -1;
        return 1;
    });

    // Check that each .in file has a related .out file
    for (let i = 0; i < fileNames.length; i += 2) {
        const first = fileNames[i].split('.').splice(0, 2).join('.');
        const second = fileNames[i + 1].split('.').splice(0, 2).join('.');

        // There is a .in without a related .out
        if (first !== second) throw new Error('Unrelated files');

        console.log('ok');
    }

    const results: Record<
        string,
        { in?: string; out?: string; isPretest: boolean }
    > = {};
    // I've drove to get this little trick
    // My bro promisfyed the callbacks... a real genius
    await Promise.all(
        fileNames.map(async (fileName) => {
            const file = await zipFiles[fileName].async('blob');
            const text = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.addEventListener('load', (event) => {
                    if (event.target?.result) {
                        resolve(event.target.result as string);
                    } else {
                        reject(
                            new Error('FileReader failed to read the file.'),
                        );
                    }
                });
                reader.addEventListener('error', () => {
                    reject(new Error('FileReader encountered an error.'));
                });
                reader.readAsText(file);
            });

            const fileNameParts = fileName.split('.');
            const fileNameStart = `${fileNameParts[0]}.${fileNameParts[1]}`;
            const fileType = fileNameParts[2] as 'in' | 'out'; // Forced cast...
            if (!(fileNameStart in results)) {
                results[fileNameStart] = { isPretest: false };
            }
            results[fileNameStart][fileType] = text;
        }),
    );

    // I return the sorted files to show them also sorted
    return { results, sortedFileNames: fileNames };
}
