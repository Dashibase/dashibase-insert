export interface Block {
  type: BlockType;
  details: Details;
}

export enum BlockType {
  Text = 'TEXT',
  H1 = 'H1',
  H2 = 'H2',
  Divider = 'DIVIDER',
  ShortAnswer = 'SHORT_ANSWER',
  LongAnswer = 'LONG_ANSWER',
  Date = 'DATE',
  Time = 'TIME',
  Datetime = 'DATETIME',
  Bool = 'BOOL',
  Dropdown = 'DROPDOWN',
}

export interface Details {
  attributeId?: string;
  hasLabel?: boolean;
  label?: string;
  value?: string;
  required?: boolean;
  options?: string[];
}

export interface Option {
  icon?: string;
  label: string;
  callback?: () => any;
  type: string;
}

export const formatToType = {
  'text': 'text',
  'character varying': 'text',
  'smallint': 'int',
  'integer': 'int',
  'bigint': 'int',
  'real': 'float',
  'double precision': 'float',
  'numeric': 'float',
  'json': 'json',
  'jsonb': 'json',
  'uuid': 'uuid',
  'time without time zone': 'time',
  'time with time zone': 'time',
  'timestamp without time zone': 'datetime',
  'timestamp with time zone': 'datetime',
  'date': 'date',
  'boolean': 'bool',
} as {[k:string]: string}

export const typeToIcon = {
  'text': 'io-text',
  'int': 'bi-123',
  'float': 'bi-123',
  'json': 'ri-braces-line',
  'uuid': 'hi-credit-card',
  'time': 'md-accesstime',
  'date': 'hi-calendar',
  'datetime': 'md-accesstime',
  'bool': 'ri-toggle-line',
}

export const typeToInput = {
  'text': [
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
    BlockType.Dropdown,
  ],
  'int': [
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'float': [
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'json': [
    BlockType.LongAnswer,
    BlockType.ShortAnswer,
  ],
  'uuid': [
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'time': [
    BlockType.Time,
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'date': [
    BlockType.Date,
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'datetime': [
    BlockType.Datetime,
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
  'bool': [
    BlockType.Bool,
    BlockType.ShortAnswer,
    BlockType.LongAnswer,
  ],
}
