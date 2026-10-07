# IBM HR attrition data

`ibm_hr_attrition.csv` is created the first time `python -m ml.train` runs.

Source: the public IBM HR Analytics Employee Attrition & Performance table mirrored by IBM AIF360:

https://raw.githubusercontent.com/IBM/employee-attrition-aif360/master/data/emp_attrition.csv

It has 1,470 employees and 35 columns, including the `Attrition` target. The file was not already stored in this repository, so the loader downloads that public copy instead of inventing rows.
