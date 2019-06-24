import ts from 'typescript';

import { TransformContext } from '../transform';

export class CSharpContext implements TransformContext {
	public *traversal(type: ts.Type) {
		if (!type) {
			return null;
		}

		const typeName = this.obtainTypeName(type);
		console.log(typeName);
	}

	public getKnownObjectName(name: string) {
		switch (name) {
			case 'Array': return 'List';
			case 'Number': return 'int';
			case 'Date': return 'DateTime';
			case 'Boolean': return 'bool';
		}
		return name;
	}

	// CodeGen시 필터링할 타입들
	public isFilteredType(typeText: string) {
		switch (typeText) {
			case 'RegExp': return true;
			case 'any': return true;
		}
		return false;
	}

	public isForceChangeType(name: string) {
		switch(name) {
			case 'Date': return true;
		}
		return false;
	}

	public obtainTypeName(type: ts.Type): string {
		if ('objectFlags' in type) {
			const objectFlags = (type as ts.ObjectType).objectFlags;
			if (objectFlags & ts.ObjectFlags.Reference) {
				const typeRef = type as ts.TypeReference;
				const target = typeRef.target;

				// Unwrapping typeArguments
				if (target.symbol.getName() === 'Promise') {
					return this.obtainTypeName(typeRef.typeArguments![0]);
				} else {
					const name = this.getKnownObjectName(target.symbol.getName());

					if (typeRef.typeArguments) {
						const ta = typeRef.typeArguments.map(x =>
							this.obtainTypeName(x)).join(', ');

						return name + `<${ta}>`;
					} else {
						return name;
					}
				}
			}
		}

		if (type.flags & ts.TypeFlags.Boolean) {
			return 'bool';
		}
		if (type.flags & ts.TypeFlags.Number) {
			return 'int';
		}
		if (type.flags & ts.TypeFlags.String) {
			return 'string';
		}
		if (type.flags & ts.TypeFlags.EnumLiteral) {
			const name = this.getKnownObjectName(type.symbol.getName());
			return name;
		}
		if (type.flags & ts.TypeFlags.Union) {
			throw new Error(`Union type not supported`);
		}
		if (type.flags & ts.TypeFlags.NonPrimitive) {
			throw new Error(`Non primitive type not supported`);
		}
		if (type.flags & ts.TypeFlags.Any) {
			if ('intrinsicName' in type) {
				const intrinsicName = (type as ts.Type & { intrinsicName: string }).intrinsicName;
				if (intrinsicName === 'error') {
					throw new Error('Type Error');
				}
			}
		}

		const name = this.getKnownObjectName(type.symbol.getName());
		return name;
	}
}
