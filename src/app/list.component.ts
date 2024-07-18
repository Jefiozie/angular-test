import { AsyncPipe, JsonPipe } from "@angular/common";
import { Component, effect, inject, signal, untracked } from "@angular/core";
import { Observable } from "rxjs";
import { SwapiService } from "./swapi.service";
import { aSyncComputed } from "./asyncComputed";
import { derivedAsync } from "ngxtension/derived-async";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [JsonPipe, AsyncPipe],
  template: ` {{ $internalsignalValue() }}
    <input
      type="text"
      [value]="$searchValue()"
      (input)="$searchValue.set($any($event.target).value)"
    />
    <pre>Without computed async</pre>
    <ol>
      @for (person of people$ |async; track $index) {
      <li>{{ person.name }}</li>
      }
    </ol>
    <pre>with computed async</pre>
    <ol>
      @for (person of $people(); track $index) {
      <li>{{ person.name }}</li>
      }
    </ol>`,
  styles: [],
})
export class ListComponent {
  $searchValue = signal<string>("");
  #service = inject(SwapiService);
  $internalsignalValue = this.#service.internalSearchValue.asReadonly();
  people$!: Observable<any>;

  $people = aSyncComputed(() => this.#service.search(this.$searchValue()));
    // $people = derivedAsync(() => this.#service.search(this.$searchValue()));

  constructor() {
    effect(() => {
      const searchValue = this.$searchValue();
      // a normal call in the effect (I dont like this approach)
      this.people$ = this.#service.search(searchValue);

      // this is not possible we could change the effect to writeable but I believe you dont want this
      //   this.people$ = this.#service.searchWithSignal(searchValue);

      // this is with untracked this works because it wont reference the signals within the service
      //   this.people$ = untracked(() =>
      //     this.#service.searchWithSignal(searchValue)
      //   );
    });

    setTimeout(() => {
      this.$searchValue.set('Luke')
    }, 5000);
  }
}
