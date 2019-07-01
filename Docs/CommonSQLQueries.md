# Common SQL Queries

This is meant to be a list of commonly used sql queries in the codebase.

## All roads lead to the ExpAssay2reagent table

Most of the existing APIs use the ExpAssay2reagent table as their central query point.

All the APIs that return code to the webserver are in : `chemgen-next-server/common/models/ExpSet`.

For the most part, any of the views on the server side are generated from by somehow first getting a list of assay_ids or assay2reagent_ids, and then generating the ExpSets based on those ids.

Once I have list of either exp_group_ids, treatment_group_ids or assay_ids I can just do a join to get all the data corresponding to those.

## Contact Sheet

### Get a batch that hasn't been scored in the contact sheet 

This would get all batch ids that have an assay that haven't been scored in the contact sheet

```
select distinct `exp_workflow_id` from `exp_assay2reagent` 
where `reagent_type` like 'treat%' and `reagent_id` is not null and `screen_id` in (1)  
and not exists 
(select 1 from `exp_manual_scores` 
where (exp_assay2reagent.assay_id = exp_manual_scores.assay_id ) AND (exp_manual_scores.manualscore_group = 'FIRST_PASS')
) 
group by `exp_workflow_id` limit 1000
```

### Get  all interesting results from a particular screen 

Note: A search object gets passed to this same function, so the WHEREs are generated dynamically, and be filtered on anything we have in the ExpAssay2reagent table (assay_id, treatment_group_id, exp_group_id, plate_id, screen_id, batch_id, etc)

```
select distinct `treatment_group_id` from `exp_assay2reagent` 
and `treatment_group_id` is not null 
and `screen_id` in (1) 
and exists (
select 1 from `exp_manual_scores` 
where (exp_assay2reagent.assay_id = exp_manual_scores.assay_id ) 
AND (exp_manual_scores.manualscore_group = \'FIRST_PASS\') 
AND (exp_manual_scores.manualscore_value = 1)
)
```

### Get exp sets that have a detailed score

The detailed score is the embryonic lethality low/medium/high

All the detailed scores have basically a flag in the manualscore_group called 'HAS_MANUAL_SCORE', that does nothing but indicate that this exp set has gone through the detailed scoring.

```
select distinct `treatment_group_id` from `exp_assay2reagent` 
where `treatment_group_id` is not null 
and `screen_id` in (1) 
and exists (
select 1 from `exp_manual_scores` 
where (exp_assay2reagent.treatment_group_id = exp_manual_scores.treatment_group_id )
 AND (exp_manual_scores.manualscore_group = 'HAS_MANUAL_SCORE')
)
```
