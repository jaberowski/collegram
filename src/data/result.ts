type Result<Error, Value> =
  | {
      success: false;
      error: Error;
    }
  | {
      success: true;
      value: Value;
    };
