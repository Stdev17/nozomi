import path from 'path';
import fse from 'fs-extra';
import mustache from 'mustache';
import { paths } from './config';

export enum TemplateKind {
	REST = 'rest',
	Message = 'message',
	Struct = 'struct',
}

export interface RESTTemplate {
	kind: TemplateKind.REST;
	rootName: string;
	namespace: string;
	classes: BaseTemplateClass[];
	method?: TemplateMethod;
}

export interface TemplateMethod {
	req: string;
	resp: string;
	url: string;
	method: string;
}

export interface BaseTemplateClass {
	className: string;
	flag: {
		class?: boolean;
		enum?: boolean;
	};
	members: BaseTemplateMember[];
}

export interface BaseTemplateMember {
	type: string;
	optional?: boolean;
	name: string;
	flag?: {
		enum?: boolean;
	};
	caseName: string;
}

export interface MessageTemplate {
	kind: TemplateKind.Message;
	name: string;
	namespace: string;
	type: string;
	channel: string;
	event: string;
	dispatcher: string;
	base: BaseTemplateClass;
	classes: BaseTemplateClass[];
}

export interface DispatcherTemplate {
	name: string;
	namespace: string;
	dispatcher: string;
	items: MessageTemplate[];
}

export interface BaseDispatcherTemplate {
	namespace: string;
	items: string[];
}

export interface RequestHandlerTemplate {
	namespace: string;
}

export interface StructTemplate {
	kind: TemplateKind.Struct;
	name: string;
	namespace: string;
	base: BaseTemplateClass;
	classes: BaseTemplateClass[];
}

export class Render {
	public static rest(template: RESTTemplate) {
		return mustache.render(readTemplateFile('REST.template'), template);
	}

	public static message(template: MessageTemplate) {
		return mustache.render(readTemplateFile('Message.template'), template);
	}

	public static generatedDispatcher(template: DispatcherTemplate) {
		return mustache.render(readTemplateFile('GeneratedDispatcher.template'), template);
	}

	public static baseDispatcher(template: BaseDispatcherTemplate) {
		return mustache.render(readTemplateFile('BaseDispatcher.template'), template);
	}

	public static baseRequestHandler(template: RequestHandlerTemplate) {
		return mustache.render(readTemplateFile('BaseRequestHandler.template'), template);
	}

	public static struct(template: StructTemplate) {
		return mustache.render(readTemplateFile('Struct.template'), template);
	}
}

function readTemplateFile(name: string) {
	const filename = path.join(paths.root, 'template', name);
	const encoding = { encoding: 'utf8' };
	return fse.readFileSync(filename, encoding);
}
