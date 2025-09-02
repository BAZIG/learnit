'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IPersonalAnalysis } from '@/models/PersonalAnalysis';
import { INews } from '@/models/News';

export default function Investment() {
  const [analyses, setAnalyses] = useState<IPersonalAnalysis[]>([]);
  const [news, setNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analysesRes, newsRes] = await Promise.all([
        fetch('/api/personal-analyses'),
        fetch('/api/news')
      ]);
      
      if (analysesRes.ok) {
        const analysesData = await analysesRes.json();
        setAnalyses(analysesData.analyses.slice(0, 3)); // Show only latest 3
      }
      
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.news.slice(0, 2)); // Show only latest 2
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTendencyColor = (tendency: string) => {
    switch (tendency) {
      case 'bullish': return 'text-green-600 bg-green-100';
      case 'bearish': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'text-green-600 bg-green-100 border-green-300';
      case 'bearish': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    }
  };
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Opportunités d&apos;Investissement
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Découvrez nos stratégies d&apos;investissement pour optimiser votre portefeuille financier
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Investment 1 */}
            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Centre de Bien-être</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Investissement dans un centre de bien-être moderne proposant des services de naturopathie et d&apos;homeopathie.
                  </p>
                </div>
              </div>
            </div>

            {/* Investment 2 */}
            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Boutique en Ligne</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Développement d&apos;une plateforme e-commerce spécialisée dans les produits de santé naturelle.
                  </p>
                </div>
              </div>
            </div>

            {/* Investment 3 */}
            <div className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Formation Continue</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Programme de formation professionnelle en naturopathie et homeopathie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Investment Analyses Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Analyses d&apos;Investissement Personnel
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Nos dernières analyses et recommandations d&apos;investissement
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Chargement des analyses...</p>
            </div>
          ) : analyses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {analyses.map((analysis) => (
                  <div key={analysis._id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{analysis.ticker}</h3>
                          <p className="text-sm text-gray-600">{analysis.assetName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTendencyColor(analysis.tendency)}`}>
                          {analysis.tendency}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Horizon:</span>
                          <span className="font-medium text-gray-900">
                            {analysis.timeFrame.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-500">Confiance:</span>
                          <span className="font-medium text-gray-900">
                            {analysis.confidence}/10
                          </span>
                        </div>
                      </div>

                      {analysis.targetPrice && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-800">
                            <span className="font-medium">Objectif:</span> ${analysis.targetPrice}
                          </div>
                        </div>
                      )}

                      {analysis.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {analysis.description.length > 100 
                            ? `${analysis.description.substring(0, 100)}...`
                            : analysis.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link 
                  href="/personal-analyses"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Voir toutes les analyses
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                Aucune analyse personnelle disponible pour le moment
              </div>
            </div>
          )}
        </div>

        {/* Latest News Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Dernières Actualités Marché
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Événements récents et leur impact sur les marchés financiers
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Chargement des actualités...</p>
            </div>
          ) : news.length > 0 ? (
            <>
              <div className="space-y-8">
                {news.map((newsItem) => (
                  <div key={newsItem._id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{newsItem.title}</h3>
                          <p className="text-sm text-gray-500">
                            {newsItem.publishedAt 
                              ? new Date(newsItem.publishedAt).toLocaleDateString('fr-FR')
                              : 'Brouillon'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Événement:</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {newsItem.event.length > 200 
                            ? `${newsItem.event.substring(0, 200)}...`
                            : newsItem.event
                          }
                        </p>
                      </div>

                      {newsItem.affectedAssets.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">Actifs Affectés:</h4>
                          <div className="flex flex-wrap gap-2">
                            {newsItem.affectedAssets.map((asset, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getImpactColor(asset.impact)}`}
                              >
                                {asset.ticker} {asset.impact === 'bullish' ? '▲' : asset.impact === 'bearish' ? '▼' : '◆'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Attentes:</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {newsItem.expectations.length > 150 
                            ? `${newsItem.expectations.substring(0, 150)}...`
                            : newsItem.expectations
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link 
                  href="/news"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Voir toutes les actualités
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                Aucune actualité disponible pour le moment
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 