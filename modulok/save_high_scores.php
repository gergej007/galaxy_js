<?php
    if(isset($_POST[0]["name"])){

      $new_records = "";

        foreach($_POST as $idx => $item){
          if($idx < 9){
             $line = $item["name"].";".$item["score"].";".$item["killed"]."\r\n";
          $new_records.=$line;
          }
         else{
          $line = $item["name"].";".$item["score"].";".$item["killed"];
          $new_records.=$line;
         } 
        }
                          
        $fm1=fopen("scr/high_scores.csv","w");
        $fm2=fopen("scr/high_scores_backup.csv","w");
        fwrite($fm1, $new_records);
        fwrite($fm2, $new_records);
        fclose($fm1);
        fclose($fm2);
        
        echo $new_records;      
    }
?>