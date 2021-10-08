import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getStyle(s: string, styled = true) {
    let status = '';
    switch (status){
      case 'In Work': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Resolved': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'New': return {'background-color': '#f7cecd', border: '2px solid #aa1f1c', color: '#aa1f1c'};
      case 'Rejected': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Check': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'In Rework': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Paused': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Archive': return {'background-color': '#e7ecca', border: '2px solid #606a26', color: '#606a26'};
      case 'Not resolved': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Closed': return {'background-color': '#e7ecca', border: '2px solid #606a26', color: '#606a26'};
      case 'Send to Approval': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Approved': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Not approved': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
      case 'Ready to send': return {'background-color': '#e7ecca', border: '2px solid #606a26', color: '#606a26'};
      case 'On reApproval': return {'background-color': '#feeccd', border: '2px solid #d78a16', color: '#d78a16'};
    }
    return{};
  }
}
