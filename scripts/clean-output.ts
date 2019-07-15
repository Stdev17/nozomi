/**
 * output 폴더를 비우는 스크립트
 */
import { paths } from '../src/config';
import { clean } from './utils';

const outputPath = paths.output;
console.log(`clean output folder: ${outputPath}`);
clean(outputPath);
