import type {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	IExecuteWorkflowInfo,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { loadOptions } from './methods';
import { getGoogleSheet, getResults, getSheet } from './utils/evaluationTriggerUtils';
import { document, sheet } from '../Google/Sheet/GoogleSheetsTrigger.node';
import { readFilter } from '../Google/Sheet/v2/actions/sheet/read.operation';
import { authentication } from '../Google/Sheet/v2/actions/versionDescription';

let startingRow = 2;

export class EvaluationTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Evaluation Trigger',
		icon: 'fa:check-double',
		name: 'evaluationTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Runs an evaluation',
		eventTriggerDescription: '',
		maxNodes: 1,
		defaults: {
			name: 'Evaluation Trigger',
		},

		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'googleApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['serviceAccount'],
					},
				},
				testedBy: 'googleApiCredentialTest',
			},
			{
				name: 'googleSheetsOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName:
					'Pulls a test dataset from a Google Sheet. The workflow will run once for each row, in sequence. More info.', // TODO Change
				name: 'notice',
				type: 'notice',
				default: '',
			},
			authentication,
			document,
			sheet,
			{
				displayName: 'Limit Rows',
				name: 'limitRows',
				type: 'boolean',
				default: false,
				noDataExpression: true,
				description: 'Whether to limit number of rows to process',
			},
			{
				displayName: 'Max Rows to Process',
				name: 'maxRows',
				type: 'string',
				default: '10',
				description: 'Maximum number of rows to process',
				noDataExpression: false,
				displayOptions: { show: { limitRows: [true] } },
			},
			readFilter,
		],
	};

	methods = { loadOptions };

	async execute(this: IExecuteFunctions) {
		const workflowId = this.getWorkflow().id;

		const workflowInfo: IExecuteWorkflowInfo = {};
		workflowInfo.id = workflowId as string;

		const maxRows = this.getNodeParameter('limitRows', 0)
			? parseInt(this.getNodeParameter('maxRows', 0) as string)
			: 1000;
		const endingRow = startingRow + maxRows;

		const rangeOptions = {
			rangeDefinition: 'specifyRange',
			headerRow: 1,
			firstDataRow: startingRow,
		};

		const googleSheetInstance = getGoogleSheet.call(this);

		const googleSheet = await getSheet.call(this, googleSheetInstance);

		let operationResult: INodeExecutionData[] = [];

		operationResult = await getResults.call(
			this,
			operationResult,
			1,
			endingRow,
			googleSheetInstance,
			googleSheet,
			rangeOptions,
		);

		if (operationResult.length === 0) {
			startingRow = 1;
			return [];
		}

		startingRow = endingRow + 1;

		return [operationResult];
		// TODO: Add hasLeft
	}
}
