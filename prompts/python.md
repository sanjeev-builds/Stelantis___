# Python / Data / ML Prompts

## Quick data exploration
```
Load [datasets/mock/file.json or real CSV path] with pandas, show shape,
dtypes, and summary stats, and flag anything that looks off (nulls,
outliers, inconsistent units) before we build a model/feature on top of it.
```

## Build a quick model/heuristic
```
Using [dataset], build a [classification/regression/rule-based] approach
to predict [target] from [features]. Keep it simple and explainable for
a demo — a judge should be able to understand the logic in one sentence.
Print a basic accuracy/error metric.
```

## Turn a notebook experiment into a callable function
```
Here's exploratory code: [paste]. Turn it into a clean function in
[target file] that the FastAPI backend can call, with type hints and
no notebook-only code (no display(), no magic commands).
```
