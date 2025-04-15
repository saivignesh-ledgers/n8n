import type { IExecuteFunctions, INodeExecutionData, IDataObject, INode } from 'n8n-workflow';

import { readSheet } from '../../Google/Sheet/v2/actions/utils/readOperation';
import { GoogleSheet } from '../../Google/Sheet/v2/helpers/GoogleSheet';
import type { ResourceLocator } from '../../Google/Sheet/v2/helpers/GoogleSheets.types';
import { getSpreadsheetId } from '../../Google/Sheet/v2/helpers/GoogleSheets.utils';

export async function getSheet(
	this: IExecuteFunctions,
	googleSheet: any,
): Promise<{
	title: string;
	sheetId: number;
}> {
	const sheetWithinDocument = this.getNodeParameter('sheetName', 0, undefined, {
		extractValue: true,
	}) as string;
	const { mode: sheetMode } = this.getNodeParameter('sheetName', 0) as {
		mode: ResourceLocator;
	};

	const res = await googleSheet.spreadsheetGetSheet(this.getNode(), sheetMode, sheetWithinDocument);

	return res;
}

export function getGoogleSheet(this: IExecuteFunctions) {
	const { mode, value } = this.getNodeParameter('documentId', 0) as IDataObject;
	const spreadsheetId = getSpreadsheetId(this.getNode(), mode as ResourceLocator, value as string);

	const googleSheet = new GoogleSheet(spreadsheetId, this);

	return googleSheet;
}

export async function getEndingRow(this: IExecuteFunctions) {
	return 4;
}

// export async function hasNextRow(sheetName: any, endingRow: number) {
// 	const rangeString = `${sheetName}!${endingRow}:${endingRow + 1}`;

// 	operationResult = await readSheet.call(
// 		this,
// 		googleSheet,
// 		sheetName,
// 		0,
// 		operationResult,
// 		5,
// 		[],
// 		rangeString,
// 	);
// }

export async function getResults(
	this: IExecuteFunctions,
	operationResult: INodeExecutionData[],
	startingRow: number,
	endingRow: number,
	googleSheet: GoogleSheet,
	result: { title: string; sheetId: number },
): Promise<INodeExecutionData[]> {
	const maxRows = this.getNodeParameter('limitRows', 0)
		? (this.getNodeParameter('maxRows', 0) as string)
		: undefined;
	const sheetName = result.title;

	// const rangeString = maxRows ? `${sheetName}!${startingRow}:${maxRows}` : `${sheetName}`;
	const rangeString = `${sheetName}!${startingRow}:${endingRow}`;

	operationResult = await readSheet.call(
		this,
		googleSheet,
		sheetName,
		0,
		operationResult,
		5,
		[],
		rangeString,
	);

	return operationResult;
}

export async function getRowsLeft(
	this: IExecuteFunctions,
	googleSheet: GoogleSheet,
	sheetName: string,
	operationResult: INodeExecutionData[],
) {
	// TODO: Convert to function
	// Doesn't totally work with limit
	const entireSheet: INodeExecutionData[] = await readSheet.call(
		this,
		googleSheet,
		sheetName,
		0,
		[],
		5,
		[],
		sheetName,
	);
	const rowsLeft = entireSheet.length - operationResult.length;

	operationResult.push({
		json: {
			_rowsLeft: rowsLeft,
		},
		pairedItems: [{ item: 0 }],
	});
}
