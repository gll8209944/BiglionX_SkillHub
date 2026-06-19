/**
 * KnowledgeUploadValidator - 知识片段文件上传校验工具
 * 支持 CSV/JSON 文件类型校验、大小限制、结构验证和预览数据生成
 */

export interface ValidationResult {
  valid: boolean;
  contentType: 'csv' | 'json' | null;
  fileName: string;
  fileSize: number;
  error?: string;
  preview?: unknown;
  headers?: string[];
  rowCount?: number;
  columns?: string[];
}

export class KnowledgeUploadValidator {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_EXTENSIONS = ['.csv', '.json'];

  /**
   * 校验文件
   */
  validateFile(file: File): ValidationResult {
    const result: ValidationResult = {
      valid: false,
      contentType: null,
      fileName: file.name,
      fileSize: file.size,
    };

    // 检查文件大小
    if (file.size > this.MAX_FILE_SIZE) {
      result.error = `文件大小超过限制（最大 10MB），当前大小：${(file.size / 1024 / 1024).toFixed(2)}MB`;
      return result;
    }

    if (file.size === 0) {
      result.error = '文件为空';
      return result;
    }

    // 检查文件扩展名
    const extension = this.getExtension(file.name);
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      result.error = `不支持的文件类型「${extension || '未知'}」，仅支持 CSV 和 JSON 文件`;
      return result;
    }

    result.contentType = extension === '.csv' ? 'csv' : 'json';
    return result;
  }

  /**
   * 读取并预览文件内容
   */
  async previewFile(file: File): Promise<ValidationResult> {
    const validation = this.validateFile(file);
    if (!validation.valid || !validation.contentType) {
      return validation;
    }

    try {
      const text = await file.text();

      if (validation.contentType === 'csv') {
        return this.previewCSV(text, validation);
      } else {
        return this.previewJSON(text, validation);
      }
    } catch (error) {
      validation.error = `读取文件失败：${(error as Error).message}`;
      return validation;
    }
  }

  /**
   * CSV 预览
   */
  private previewCSV(rawText: string, result: ValidationResult): ValidationResult {
    const lines = rawText.trim().split('\n').filter(Boolean);

    if (lines.length < 1) {
      result.error = 'CSV 文件为空';
      return result;
    }

    // 解析表头
    const headers = this.parseCSVLine(lines[0]);
    result.headers = headers;
    result.columns = headers;
    result.rowCount = lines.length - 1;

    // 预览前 5 行
    const previewRows = lines.slice(1, 6).map((line) => {
      const values = this.parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    result.preview = {
      headers,
      rows: previewRows,
      totalRows: result.rowCount,
    };

    result.valid = result.rowCount > 0;
    if (!result.valid) {
      result.error = 'CSV 文件没有数据行（仅有表头）';
    }

    return result;
  }

  /**
   * JSON 预览
   */
  private previewJSON(rawText: string, result: ValidationResult): ValidationResult {
    try {
      const data = JSON.parse(rawText);

      let previewData: unknown;
      let columns: string[] = [];

      if (Array.isArray(data)) {
        result.rowCount = data.length;
        previewData = data.slice(0, 5);
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
          columns = Object.keys(data[0] as Record<string, unknown>);
          result.columns = columns;
        }
      } else if (typeof data === 'object' && data !== null) {
        columns = Object.keys(data as Record<string, unknown>);
        result.columns = columns;
        previewData = data;
      } else {
        previewData = data;
      }

      result.preview = previewData;

      if (Array.isArray(data) && data.length === 0) {
        result.error = 'JSON 数组为空';
        return result;
      }

      result.valid = true;
      return result;
    } catch (error) {
      result.error = `JSON 解析失败：${(error as Error).message}`;
      return result;
    }
  }

  /**
   * 获取文件扩展名
   */
  private getExtension(fileName: string): string | null {
    const idx = fileName.lastIndexOf('.');
    return idx >= 0 ? fileName.slice(idx).toLowerCase() : null;
  }

  /**
   * 解析 CSV 行（支持引号转义）
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }
}

// 导出单例
export const knowledgeUploadValidator = new KnowledgeUploadValidator();
