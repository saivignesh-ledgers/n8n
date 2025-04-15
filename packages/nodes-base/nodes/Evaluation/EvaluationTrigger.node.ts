import type {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	IDataObject,
	IExecuteWorkflowInfo,
	ExecuteWorkflowData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { loadOptions } from './methods';
import { document, sheet } from '../Google/Sheet/GoogleSheetsTrigger.node';
import { readFilter } from '../Google/Sheet/v2/actions/sheet/read.operation';
import { readSheet } from '../Google/Sheet/v2/actions/utils/readOperation';
import { authentication } from '../Google/Sheet/v2/actions/versionDescription';
import { GoogleSheet } from '../Google/Sheet/v2/helpers/GoogleSheet';
import type { ResourceLocator } from '../Google/Sheet/v2/helpers/GoogleSheets.types';
import { getSpreadsheetId } from '../Google/Sheet/v2/helpers/GoogleSheets.utils';
import { getGoogleSheet, getResults, getSheet } from './utils/evaluationTriggerUtils';

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
		const inputData = this.getInputData();
		const shouldStop = inputData.find((item) => item.json.stop);

		if (shouldStop) {
			return [];
		}

		// loop
		// for (let i = 0; i < 5; i++) {
		// 	// const inputData = this.getInputData();
		// 	const workflowId = this.getWorkflow().id;
		// 	const workflowProxy = this.getWorkflowDataProxy(0);

		// 	const workflowInfo: IExecuteWorkflowInfo = {};
		// 	workflowInfo.id = workflowId as string;
		// 	if (inputData[0].json.a === 1) {
		// 		return [];
		// 	} else {
		// 		const googleSheetInstance = getGoogleSheet.call(this);

		// 		const googleSheet = await getSheet.call(this, googleSheetInstance);

		// 		let operationResult: INodeExecutionData[] = [];

		// 		const startingRow = 1;
		// 		const endingRow = 4;

		// 		operationResult = await getResults.call(
		// 			this,
		// 			operationResult,
		// 			startingRow,
		// 			endingRow,
		// 			googleSheetInstance,
		// 			googleSheet,
		// 		);

		// 		const executionResult: ExecuteWorkflowData = await this.executeWorkflow(
		// 			workflowInfo,
		// 			[
		// 				{
		// 					index: 0,
		// 					json: { a: 1 },
		// 				},
		// 			],
		// 			undefined,
		// 			{
		// 				parentExecution: {
		// 					executionId: workflowProxy.$execution.id,
		// 					workflowId: workflowProxy.$workflow.id,
		// 				},
		// 			},
		// 		);

		// 		return [operationResult];
		// 	}

		// 	// const workflowId = this.getWorkflow().id;
		// 	// const workflowProxy = this.getWorkflowDataProxy(0);

		// 	// const workflowInfo: IExecuteWorkflowInfo = {};
		// 	// workflowInfo.id = workflowId as string;

		// 	// const executionResult: ExecuteWorkflowData = await this.executeWorkflow(
		// 	// 	workflowInfo,
		// 	// 	[
		// 	// 		{
		// 	// 			index: 0,
		// 	// 			json: { a: 1 },
		// 	// 		},
		// 	// 	],
		// 	// 	undefined,
		// 	// 	{
		// 	// 		parentExecution: {
		// 	// 			executionId: workflowProxy.$execution.id,
		// 	// 			workflowId: workflowProxy.$workflow.id,
		// 	// 		},
		// 	// 	},
		// 	// );
		// }

		// gsheets
		const googleSheetInstance = getGoogleSheet.call(this);

		const googleSheet = await getSheet.call(this, googleSheetInstance);

		let operationResult: INodeExecutionData[] = [];

		const startingRow = 20;
		const endingRow = 25;

		operationResult = await getResults.call(
			this,
			operationResult,
			startingRow,
			endingRow,
			googleSheetInstance,
			googleSheet,
		);

		return [operationResult];
	}
}
