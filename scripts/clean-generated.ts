/**
 * output 폴더를 비우는 스크립트
 */
import { paths } from '../src/config';
import { clean } from './utils';
import path from 'path';

const generatedPath = path.resolve(paths.csproj.generated, '*.*');
console.log(`clean generated folder: ${generatedPath}`);
clean(generatedPath);
