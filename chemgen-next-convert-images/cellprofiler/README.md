## Overview

The official cellprofiler image did not work for us as is. We do not need the process manager, as we want to run things directly on a rather slow filesystem. It is also not completely up to date.

## Cell Analysis Pipeline

Single Plate -> List of Images -> 1 image conversion per instance -> 1 cellprofiler instance per image
