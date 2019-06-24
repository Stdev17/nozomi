import path from 'path';
import fse from 'fs-extra';
import mustache from 'mustache';
import { paths } from './config';

type NozomiTemplateKind = 'NozomiTemplate' | 'NozomiHandlerTemplate';
export interface NozomiTemplate {
	kind: NozomiTemplateKind;
	rootName: string;
	namespace: string;
	classes: BaseTemplateClasses[];
	method?: NozomiTemplateMethod;
}

export interface NozomiTemplateMethod {
	req: string;
	resp: string;
	url: string;
	method: string;
}

export interface BaseTemplateClasses {
	className: string;
	flag: {
		class?: boolean;
		enum?: boolean;
	};
	members: BaseTemplateMembers[];
}

export interface BaseTemplateMembers {
	type: string;
	optional?: boolean;
	name: string;
	flag?: {
		enum?: boolean;
	};
	caseName: string;
}

export interface NozomiHandlerTemplate {
	kind: NozomiTemplateKind;
	name: string;
	namespace: string;
	type: string;
	channel: string;
	event: string;
	dispatcher: string;
	classes: BaseTemplateClasses[];
}

export interface NozomiDispatcherTemplate {
	name: string;
	namespace: string;
	dispatcher: string;
	items: NozomiHandlerTemplate[];
}

export interface NozomiBaseDispatcherTemplate {
	namespace: string;
	items: string[];
}

export interface NozomiRequestHandlerTemplate {
	namespace: string;
}

export class Render {
	public static nozomi(template: NozomiTemplate) {
		return mustache.render(readTemplateFile('Nozomi.template'), template);
	}

	public static nozomiHandler(template: NozomiHandlerTemplate) {
		return mustache.render(readTemplateFile('NozomiHandler.template'), template);
	}

	public static generatedDispatcher(template: NozomiDispatcherTemplate) {
		return mustache.render(readTemplateFile('GeneratedDispatcher.template'), template);
	}

	public static baseDispatcher(template: NozomiBaseDispatcherTemplate) {
		return mustache.render(readTemplateFile('BaseDispatcher.template'), template);
	}

	public static baseRequestHandler(template: NozomiRequestHandlerTemplate) {
		return mustache.render(readTemplateFile('BaseRequestHandler.template'), template);
	}
}

function readTemplateFile(name: string) {
	const filename = path.join(paths.root, 'template', name);
	const encoding = { encoding: 'utf8' };
	return fse.readFileSync(filename, encoding);
}
