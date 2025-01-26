/* eslint-disable perfectionist/sort-objects */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import express from 'express';
import { OpenAPIObject } from 'openapi3-ts/dist/oas30';
import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';

const options: Options = {
	apis: ['./src/routes/*.ts'],
	definition: {
		openapi: '3.0.0',
		info: {
			description: 'API for managing tasks',
			title: 'Task Management API',
			version: '1.0.0'
		},
		security: [
			{
				bearerAuth: []
			}
		],
		servers: [
			{
				description: 'Development server',
				url: '/api/v1'
			}
		],
		tags: [
			{
				description: 'API for managing users',
				name: 'Users'
			},
			{
				description: 'API for managing tasks',
				name: 'Tasks'
			}
		],
		components: {
			schemas: {
				User: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							description: 'The unique identifier for the user.',
							readOnly: true
						},
						first_name: {
							type: 'string',
							description: "The user's first name."
						},
						last_name: {
							type: 'string',
							description: "The user's last name."
						},
						email: {
							type: 'string',
							description: "The user's email address.",
							format: 'email'
						},
						password: {
							type: 'string',
							description: "The user's password."
						},
						password_confirmation: {
							type: 'string',
							description: "Confirmation of the user's password."
						}
					},
					required: [
						'email',
						'first_name',
						'last_name',
						'password',
						'password_confirmation'
					]
				},
				PartialTask: {
					properties: {
						description: {
							description: 'Description of the task',
							type: 'string'
						},
						priority: {
							default: 1,
							description: 'Priority of the task',
							type: 'integer'
						},
						status: {
							description: 'Status of the task',
							enum: ['in_progress', 'done'],
							type: 'string'
						},
						title: {
							description: 'Title of the task',
							type: 'string'
						}
					},
					type: 'object'
				},
				Task: {
					properties: {
						id: {
							description: 'ID of the task',
							type: 'string'
						},
						description: {
							description: 'Description of the task',
							type: 'string'
						},
						priority: {
							default: 1,
							description: 'Priority of the task',
							type: 'integer'
						},
						status: {
							description: 'Status of the task',
							enum: ['in_progress', 'done'],
							type: 'string'
						},
						title: {
							description: 'Title of the task',
							type: 'string'
						}
					},
					type: 'object'
				}
			},
			securitySchemes: {
				bearerAuth: {
					bearerFormat: 'JWT',
					scheme: 'bearer',
					type: 'http'
				}
			}
		}
	}
};

const specs = swaggerJsdoc(options) as OpenAPIObject;

function swaggerDocs(app: express.Application) {
	app.use('/docs', serve, setup(specs));
}

export default swaggerDocs;
