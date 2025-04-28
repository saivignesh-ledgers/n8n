import type { IExecuteFunctions, INodeExecutionData, IDataObject, INode } from 'n8n-workflow';

import { readSheet } from '../../Google/Sheet/v2/actions/utils/readOperation';
import { GoogleSheet } from '../../Google/Sheet/v2/helpers/GoogleSheet';
import type { ResourceLocator } from '../../Google/Sheet/v2/helpers/GoogleSheets.types';
import { getSpreadsheetId } from '../../Google/Sheet/v2/helpers/GoogleSheets.utils';

export async function getSheet(
	this: IExecuteFunctions,
	googleSheet: GoogleSheet,
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

	return await googleSheet.spreadsheetGetSheet(this.getNode(), sheetMode, sheetWithinDocument);
}

export function getGoogleSheet(this: IExecuteFunctions) {
	const { mode, value } = this.getNodeParameter('documentId', 0) as IDataObject;
	const spreadsheetId = getSpreadsheetId(this.getNode(), mode as ResourceLocator, value as string);

	const googleSheet = new GoogleSheet(spreadsheetId, this);

	return googleSheet;
}

export async function getResults(
	this: IExecuteFunctions,
	operationResult: INodeExecutionData[],
	startingRow: number,
	endingRow: number,
	googleSheet: GoogleSheet,
	result: { title: string; sheetId: number },
	rangeOptions: IDataObject,
): Promise<INodeExecutionData[]> {
	const sheetName = result.title;

	const rangeString = `${sheetName}!${startingRow}:${endingRow}`;

	operationResult = await readSheet.call(
		this,
		googleSheet,
		sheetName,
		0,
		operationResult,
		this.getNode().typeVersion,
		[],
		rangeString,
		true,
		rangeOptions,
	);

	return operationResult;
}

export async function getRowsLeft(
	this: IExecuteFunctions,
	googleSheet: GoogleSheet,
	sheetName: string,
	operationResult: INodeExecutionData[],
	rangeString: string,
) {
	const remainderSheet: INodeExecutionData[] = await readSheet.call(
		this,
		googleSheet,
		sheetName,
		0,
		[],
		this.getNode().typeVersion,
		[],
		rangeString,
	);

	operationResult.push({
		json: {
			_rowsLeft: remainderSheet.length + 1, // Add 1 to account for the header row
		},
		pairedItems: [{ item: 0 }],
	});
}
