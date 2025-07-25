import json
import re
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from enum import Enum


class MatchCategory(Enum):
    GEOGRAPHIC = "geographic"
    PROGRAM_AREA = "program_area"
    BENEFICIARY = "beneficiary"
    FUNDING_TYPE = "funding_type"
    PRIORITY = "priority"
    EXCLUSION = "exclusion"


@dataclass
class KeywordMatch:
    keyword: str
    category: MatchCategory
    weight: float
    context: str = ""


class PeruGrantKeywordMatcher:
    """
    Intelligent keyword matcher for Peru-specific grants based on Mission Huascaran's needs.
    Uses weighted scoring across multiple categories to identify relevant opportunities.
    """
    
    def __init__(self):
        self.keywords = self._load_peru_keywords()
        self.category_weights = {
            MatchCategory.GEOGRAPHIC: 3.0,      # Highest weight - geographic relevance
            MatchCategory.PROGRAM_AREA: 2.5,    # High weight - program alignment
            MatchCategory.BENEFICIARY: 2.0,     # Medium-high - target population
            MatchCategory.FUNDING_TYPE: 1.5,    # Medium - funding category
            MatchCategory.PRIORITY: 1.8,        # Medium-high - priority indicators
            MatchCategory.EXCLUSION: -5.0       # Strong negative weight - exclusions
        }
        
        # Minimum score threshold for considering a grant relevant
        self.relevance_threshold = 3.0
        
    def _load_peru_keywords(self) -> Dict[MatchCategory, List[str]]:
        """Load and categorize Peru grant keywords with variations."""
        return {
            MatchCategory.GEOGRAPHIC: [
                "Peru", "Perú", "Peruvian", "peruano", "peruana",
                "Andean region", "Andes", "andino", "andina",
                "Ancash Province", "Ancash", "Áncash",
                "Huascarán National Park", "Huascaran", "Huascarán",
                "Rural Peru", "Peru rural", "rural Peru",
                "Highland communities", "comunidades altoandinas",
                "Mountain regions", "regiones montañosas",
                "Peruvian highlands", "altiplano peruano",
                "Remote villages Peru", "aldeas remotas Peru",
                "Indigenous territories", "territorios indígenas",
                "Latin America", "América Latina", "South America", "Sudamérica",
                # Additional international geographic terms for grants.gov
                "developing countries", "países en desarrollo",
                "international development", "desarrollo internacional",
                "overseas programs", "programas internacionales",
                "foreign assistance", "asistencia exterior",
                "global development", "desarrollo global",
                "international cooperation", "cooperación internacional"
            ],
            
            MatchCategory.PROGRAM_AREA: [
                # Education
                "rural education", "educación rural", "community learning",
                "adult literacy", "alfabetización", "digital inclusion",
                "inclusión digital", "educational access", "acceso educativo",
                "technical training", "capacitación técnica",
                
                # Economic Development  
                "microfinance", "microfinanzas", "small business",
                "pequeñas empresas", "agricultural cooperatives",
                "cooperativas agrícolas", "rural entrepreneurship",
                "emprendimiento rural", "income generation",
                "generación de ingresos", "value chain",
                
                # Healthcare
                "rural health", "salud rural", "mobile medical units",
                "unidades médicas móviles", "maternal health",
                "salud materna", "telemedicine", "telemedicina",
                "community health workers", "promotores de salud",
                "nutrition", "nutrición",
                
                # Agriculture
                "sustainable farming", "agricultura sostenible",
                "crop diversification", "diversificación de cultivos",
                "climate-smart agriculture", "agricultura climáticamente inteligente",
                "seed improvement", "mejoramiento de semillas",
                "agribusiness", "agronegocios", "organic farming",
                
                # Infrastructure
                "rural electrification", "electrificación rural",
                "water access", "acceso al agua", "sanitation",
                "saneamiento", "road construction", "construcción de carreteras",
                "digital connectivity", "conectividad digital",
                "renewable energy", "energías renovables"
            ],
            
            MatchCategory.BENEFICIARY: [
                "indigenous communities", "comunidades indígenas",
                "Quechua populations", "poblaciones quechua",
                "rural women", "mujeres rurales",
                "smallholder farmers", "pequeños agricultores",
                "mountain dwellers", "pobladores de montaña",
                "vulnerable groups", "grupos vulnerables",
                "rural populations", "poblaciones rurales",
                "mountain communities", "comunidades de montaña",
                "indigenous peoples", "pueblos indígenas"
            ],
            
            MatchCategory.FUNDING_TYPE: [
                "community development grants", "subsidios desarrollo comunitario",
                "rural infrastructure funding", "financiamiento infraestructura rural",
                "capacity building programs", "programas fortalecimiento capacidades",
                "education initiatives", "iniciativas educativas",
                "health sector grants", "subsidios sector salud",
                "agricultural development", "desarrollo agrícola",
                "NGO funding", "financiamiento ONG",
                "civil society grants", "subsidios sociedad civil",
                # Additional funding types from grants.gov
                "federal grants", "subsidios federales",
                "USAID funding", "financiamiento USAID",
                "international grants", "subsidios internacionales",
                "development assistance", "asistencia para el desarrollo",
                "foreign aid", "ayuda exterior",
                "cooperative agreements", "acuerdos de cooperación",
                "technical assistance", "asistencia técnica",
                "humanitarian aid", "ayuda humanitaria"
            ],
            
            MatchCategory.PRIORITY: [
                "Peru eligibility", "elegible Peru", "Perú elegible",
                "rural focus", "enfoque rural", "community-based",
                "basado en comunidad", "grassroots organizations",
                "organizaciones de base", "local NGOs", "ONG locales",
                "indigenous-led initiatives", "iniciativas lideradas indígenas",
                "participatory development", "desarrollo participativo",
                "bottom-up approach", "enfoque de abajo hacia arriba",
                # Additional priority indicators for grants.gov
                "international eligible", "elegible internacional",
                "developing countries eligible", "países en desarrollo elegibles",
                "non-profit organizations", "organizaciones sin fines de lucro",
                "civil society eligible", "sociedad civil elegible",
                "small grants program", "programa de pequeños subsidios",
                "capacity building focus", "enfoque fortalecimiento capacidades",
                "partnership opportunities", "oportunidades de asociación"
            ],
            
            MatchCategory.EXCLUSION: [
                "urban only", "solo urbano", "developed countries only",
                "solo países desarrollados", "research institutions only",
                "solo instituciones investigación", "government agencies only",
                "solo agencias gubernamentales", "commercial ventures only",
                "solo emprendimientos comerciales", "academic organizations only",
                "solo organizaciones académicas", "for-profit only",
                "solo con fines de lucro", "United States only", "solo Estados Unidos",
                "Europe only", "solo Europa", "US citizens only", "solo ciudadanos estadounidenses"
            ]
        }
    
    def analyze_grant_text(self, text: str, title: str = "", description: str = "") -> Dict[str, Any]:
        """
        Analyze grant text for Peru relevance using intelligent keyword matching.
        
        Args:
            text: Full grant text to analyze
            title: Grant title (optional, given higher weight)
            description: Grant description (optional, given higher weight)
        
        Returns:
            Dictionary with relevance score, matches, and recommendation
        """
        if not text:
            return self._create_empty_result()
            
        # Combine all text sources with weights
        weighted_text = f"{title} {title} {description} {description} {text}".lower()
        
        matches = []
        category_scores = {category: 0.0 for category in MatchCategory}
        
        # Find matches for each category
        for category, keywords in self.keywords.items():
            category_matches = self._find_category_matches(weighted_text, keywords, category)
            matches.extend(category_matches)
            
            # Calculate category score
            category_score = sum(match.weight for match in category_matches)
            category_scores[category] = category_score
        
        # Calculate total relevance score
        total_score = sum(
            category_scores[category] * self.category_weights[category] 
            for category in MatchCategory
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(total_score, category_scores, matches)
        
        return {
            'relevance_score': round(total_score, 2),
            'is_relevant': total_score >= self.relevance_threshold,
            'category_scores': {cat.value: round(score, 2) for cat, score in category_scores.items()},
            'matches': [self._match_to_dict(match) for match in matches],
            'recommendation': recommendation,
            'priority_level': self._calculate_priority_level(total_score),
            'exclusion_flags': [match.keyword for match in matches if match.category == MatchCategory.EXCLUSION]
        }
    
    def _find_category_matches(self, text: str, keywords: List[str], category: MatchCategory) -> List[KeywordMatch]:
        """Find keyword matches within a specific category."""
        matches = []
        
        for keyword in keywords:
            # Create regex pattern for flexible matching
            pattern = self._create_keyword_pattern(keyword)
            regex_matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in regex_matches:
                # Extract context around the match
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                context = text[start:end].strip()
                
                # Calculate match weight based on keyword importance and context
                weight = self._calculate_match_weight(keyword, context, category)
                
                matches.append(KeywordMatch(
                    keyword=keyword,
                    category=category,
                    weight=weight,
                    context=context
                ))
        
        return matches
    
    def _create_keyword_pattern(self, keyword: str) -> str:
        """Create flexible regex pattern for keyword matching."""
        # Handle multi-word keywords
        if ' ' in keyword:
            # Allow for minor variations in spacing and punctuation
            words = keyword.split()
            pattern_parts = []
            for word in words:
                escaped_word = re.escape(word)
                pattern_parts.append(escaped_word)
            pattern = r'\b' + r'[\s\-_.]*'.join(pattern_parts) + r'\b'
        else:
            # Single word - exact match with word boundaries
            pattern = r'\b' + re.escape(keyword) + r'\b'
        
        return pattern
    
    def _calculate_match_weight(self, keyword: str, context: str, category: MatchCategory) -> float:
        """Calculate weight for a keyword match based on various factors."""
        base_weight = 1.0
        
        # Boost weight for key geographic terms
        if category == MatchCategory.GEOGRAPHIC:
            if keyword.lower() in ['peru', 'perú', 'peruvian']:
                base_weight = 2.0
            elif 'andean' in keyword.lower() or 'andes' in keyword.lower():
                base_weight = 1.5
                
        # Boost weight for high-priority terms
        if category == MatchCategory.PRIORITY:
            if 'peru eligibility' in keyword.lower():
                base_weight = 2.0
            elif 'rural focus' in keyword.lower():
                base_weight = 1.5
        
        # Context-based adjustments
        context_lower = context.lower()
        if 'eligible' in context_lower or 'application' in context_lower:
            base_weight *= 1.2
        
        if 'not eligible' in context_lower or 'excluding' in context_lower:
            base_weight *= 0.5
            
        return base_weight
    
    def _generate_recommendation(self, total_score: float, category_scores: Dict[MatchCategory, float], matches: List[KeywordMatch]) -> str:
        """Generate human-readable recommendation based on analysis."""
        if total_score < self.relevance_threshold:
            return "❌ NOT RECOMMENDED: Low relevance score for Mission Huascaran's focus areas."
        
        # Check for exclusions
        exclusion_matches = [m for m in matches if m.category == MatchCategory.EXCLUSION]
        if exclusion_matches:
            return f"⚠️ CAUTION: Contains exclusion criteria: {', '.join([m.keyword for m in exclusion_matches])}"
        
        geographic_score = category_scores.get(MatchCategory.GEOGRAPHIC, 0)
        program_score = category_scores.get(MatchCategory.PROGRAM_AREA, 0)
        
        if geographic_score >= 2.0 and program_score >= 2.0:
            return "🎯 HIGHLY RECOMMENDED: Strong geographic and program alignment with Mission Huascaran."
        elif geographic_score >= 1.0 and program_score >= 1.5:
            return "✅ RECOMMENDED: Good alignment with Mission Huascaran's objectives."
        elif total_score >= 4.0:
            return "📋 WORTH REVIEWING: Decent relevance score, requires manual evaluation."
        else:
            return "⚡ MODERATE INTEREST: Some relevance, lower priority for review."
    
    def _calculate_priority_level(self, score: float) -> str:
        """Calculate priority level based on relevance score."""
        if score >= 6.0:
            return "CRITICAL"
        elif score >= 4.5:
            return "HIGH" 
        elif score >= 3.0:
            return "MEDIUM"
        elif score >= 1.5:
            return "LOW"
        else:
            return "MINIMAL"
    
    def _create_empty_result(self) -> Dict[str, Any]:
        """Create empty result for invalid input."""
        return {
            'relevance_score': 0.0,
            'is_relevant': False,
            'category_scores': {cat.value: 0.0 for cat in MatchCategory},
            'matches': [],
            'recommendation': "❌ No content to analyze",
            'priority_level': "MINIMAL",
            'exclusion_flags': []
        }
    
    def _match_to_dict(self, match: KeywordMatch) -> Dict[str, Any]:
        """Convert KeywordMatch to dictionary."""
        return {
            'keyword': match.keyword,
            'category': match.category.value,
            'weight': round(match.weight, 2),
            'context': match.context[:100] + "..." if len(match.context) > 100 else match.context
        }
    
    def batch_analyze_grants(self, grants: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Analyze multiple grants and return ranked results."""
        results = []
        
        for grant in grants:
            title = grant.get('title', '')
            description = grant.get('description', '')
            full_text = grant.get('full_text', f"{title} {description}")
            
            analysis = self.analyze_grant_text(full_text, title, description)
            analysis['original_grant'] = grant
            results.append(analysis)
        
        # Sort by relevance score (highest first)
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results
    
    def get_keyword_statistics(self) -> Dict[str, int]:
        """Get statistics about loaded keywords."""
        stats = {}
        for category, keywords in self.keywords.items():
            stats[category.value] = len(keywords)
        stats['total'] = sum(stats.values())
        return stats


def test_keyword_matcher():
    """Test the keyword matcher with sample grant data."""
    matcher = PeruGrantKeywordMatcher()
    
    # Test cases
    test_grants = [
        {
            'title': 'Rural Education Initiative for Indigenous Communities in Peru',
            'description': 'Supporting digital inclusion and adult literacy programs in Andean regions of Peru, focusing on Quechua populations and rural women.',
            'full_text': 'This program aims to improve educational access in highland communities of Peru, with special focus on indigenous territories in Ancash Province near Huascarán National Park.'
        },
        {
            'title': 'Urban Development Grant for Developed Countries',
            'description': 'Commercial ventures in urban areas of the United States only.',
            'full_text': 'This funding is exclusively for urban development projects in developed countries, targeting commercial enterprises only.'
        },
        {
            'title': 'Agricultural Cooperation Program for Latin America', 
            'description': 'Sustainable farming and microfinance initiatives for smallholder farmers.',
            'full_text': 'Community-based agricultural development program supporting rural entrepreneurship and organic farming in mountain regions of South America.'
        }
    ]
    
    print("🧪 Testing Peru Grant Keyword Matcher")
    print("=" * 50)
    
    results = matcher.batch_analyze_grants(test_grants)
    
    for i, result in enumerate(results):
        grant = result['original_grant']
        print(f"\n📝 Grant {i+1}: {grant['title']}")
        print(f"🎯 Relevance Score: {result['relevance_score']}")
        print(f"📊 Priority Level: {result['priority_level']}")
        print(f"💡 Recommendation: {result['recommendation']}")
        print(f"🔍 Top Matches:")
        
        for match in result['matches'][:5]:  # Show top 5 matches
            print(f"  - {match['keyword']} ({match['category']}) [Weight: {match['weight']}]")
        
        if result['exclusion_flags']:
            print(f"⚠️ Exclusion Flags: {', '.join(result['exclusion_flags'])}")
    
    print(f"\n📈 Keyword Statistics:")
    for category, count in matcher.get_keyword_statistics().items():
        print(f"  - {category}: {count} keywords")


if __name__ == "__main__":
    test_keyword_matcher()