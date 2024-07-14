// import { z } from "zod";

// export namespace UploadImageDTO {
//   export const zod = z
//     .object({
//       filename: zodNonEmptyString,
//     })
//     .transform((item) => {
//       const { filename, ...rest } = item;

//       return { ...rest, fileName: filename };
//     });

//   export type Type = z.TypeOf<typeof zod>;
// }
