import { describe, expect, it } from 'vitest';

import { cleanConfigBrand } from './configBrand';
import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

function stringify(value: unknown): string {
  return JSON.stringify(value);
}

describe('cleanConfigBrand', () => {
  it('keeps nested DrKhaleej discovery config strings unchanged', () => {
    const config = {
      locale: 'en',
      country: 'om',
      dir: 'ltr',
      categoryType: 'offers',
      path: '/offers',
      searchId: 'search',
      resultsId: 'results',
      badge: 'DrKhaleej offers',
      title: 'DrKhaleej title',
      subtitle: 'DrKhaleej subtitle',
      primaryCta: 'Search',
      providerCta: 'List',
      search: {
        badge: 'Search',
        title: 'DrKhaleej search',
        description: 'DrKhaleej description',
        inputLabel: 'Input',
        placeholder: 'Placeholder',
        button: 'Button',
        legend: 'Legend',
        moreFilters: 'More',
        moreLegend: 'More legend',
        countryLabel: 'Country',
        cityLabel: 'City',
        areaLabel: 'Area',
        suggestionLabel: 'Suggestions',
        useSuggestion: 'Use',
        contentType: 'Offers',
        trustAria: 'Trust',
        trust: ['DrKhaleej trust'],
        mainChips: ['Main'],
        moreChips: ['More'],
        countryOptions: ['Oman'],
        cityOptions: ['Muscat'],
        areaOptions: ['Qurum'],
        defaultCountry: 'Oman',
        defaultCity: 'Muscat',
        defaultArea: 'Qurum',
        suggestions: []
      },
      results: {
        title: 'Results',
        emptyText: 'No DrKhaleej results'
      },
      visual: {
        label: 'Visual',
        previous: 'Previous',
        next: 'Next',
        slideLabel: 'Slide',
        slides: [{ src: '/x.webp', alt: 'DrKhaleej image', caption: 'DrKhaleej caption' }]
      }
    } satisfies PublicDiscoveryPageConfig;

    const output = stringify(cleanConfigBrand(config));

    expect(output).toContain('DrKhaleej');
  });
});
