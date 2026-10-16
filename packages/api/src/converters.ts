import { ValibotToJsonSchemaConverter } from "@orpc/valibot";

// Shared by server and client so both read the contract's schemas the same way: the server uses
// them to generate the spec and coerce request strings, the client to restore native types
// (`Date`, `bigint`, ...) from JSON responses
export const converters = [new ValibotToJsonSchemaConverter()];
