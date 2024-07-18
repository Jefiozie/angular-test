import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { map } from "rxjs";

interface SwapiResponse {
  results: any;
}
@Injectable({ providedIn: "root" })
export class SwapiService {
  #httpClient = inject(HttpClient);
  #baseUri = "https://swapi.dev/api/";
  internalSearchValue = signal<string>("");
  search(searchValue: string) {
    return this.#httpClient
      .get<SwapiResponse>(`${this.#baseUri}people/?search=${searchValue}`)
      .pipe(map((response) => response.results));
  }
  searchWithSignal(searchValue: string) {
    this.internalSearchValue.set(searchValue);
    console.log(this.internalSearchValue());
    return this.#httpClient
      .get<SwapiResponse>(
        `${this.#baseUri}people/?search=${this.internalSearchValue()}`
      )
      .pipe(map((response) => response.results));
  }
}
