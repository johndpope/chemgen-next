import { NgModule , Renderer2} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExpSetApi, ExpManualScoresApi} from "../../../types/sdk/services/custom";

/**
 * WIP - Much of the functionality from the contact-sheet-primary and contact-sheet-secondary could be put in here
 */

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ContactSheetModule {

    public userName: string;
    public userId: string | number;

    constructor(private expSetApi: ExpSetApi,
                private expManualScoresApi: ExpManualScoresApi,
                private renderer: Renderer2) {
        const userName = document.getElementById('userName');
        const userId = document.getElementById('userId');
        if (userName) {
            this.userName = userName.innerText || 'dummyUser';
        }
        if (userId) {
            this.userId = userId.innerText || 0;
        }
    }

}
