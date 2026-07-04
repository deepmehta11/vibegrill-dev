# Judge rubric — Fix the account ledger

This task contains two bugs (the `balance()` sign error and the missing overdraft guard) and one feature (the `statement()` formatting). Evaluate the candidate's **process** of working with the AI, not just whether the final code passes.

- **Problem decomposition**: Did they recognize the three distinct issues (balance bug, overdraft guard, statement feature) and address them deliberately, instead of flailing at the whole file at once?
- **Prompt quality**: Were their messages to the AI specific and grounded in the actual code, tests, or error output — or vague requests like "fix this file"?
- **Verification habits**: Did they run the visible tests, read the failures, and re-run after each change? Did they look at the demo output? Or did they trust the AI and submit blindly?
- **Catching AI errors**: If the AI produced something wrong or subtly off (e.g. incorrect `statement()` padding, or an overdraft check with a boundary error), did they catch and correct it?
- **Independence**: Did they understand and steer the solution, or just paste whatever the AI generated without engaging?
