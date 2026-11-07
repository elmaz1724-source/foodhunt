import 'package:flutter/material.dart';

import 'theme/foodhunt_theme.dart';

void main() => runApp(const FoodHuntApp());

/// Native design starter. This build deliberately contains no fabricated
/// restaurant ratings and is not connected to the current web app's localStorage.
class FoodHuntApp extends StatefulWidget {
  const FoodHuntApp({super.key});

  @override
  State<FoodHuntApp> createState() => _FoodHuntAppState();
}

class _FoodHuntAppState extends State<FoodHuntApp> {
  int _tab = 0;
  bool _dark = false;
  String _query = '';
  String _selectedCategory = 'Alle';

  static const _categories = <FoodCategory>[
    FoodCategory('Burger', '🍔', Color(0xFFFFDDD2)),
    FoodCategory('Döner', '🥙', Color(0xFFE4EFDB)),
    FoodCategory('Pizza', '🍕', Color(0xFFFFE9CA)),
    FoodCategory('Sushi', '🍣', Color(0xFFE3E9FB)),
    FoodCategory('Chicken', '🍗', Color(0xFFF9E3D5)),
    FoodCategory('Desserts', '🍰', Color(0xFFF5DFEE)),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FOODHUNT.',
      debugShowCheckedModeBanner: false,
      theme: FoodHuntTheme.light(),
      darkTheme: FoodHuntTheme.dark(),
      themeMode: _dark ? ThemeMode.dark : ThemeMode.light,
      home: Builder(builder: (context) {
        return Scaffold(
          body: SafeArea(child: _screen(context)),
          bottomNavigationBar: NavigationBar(
            selectedIndex: _tab,
            onDestinationSelected: (index) => setState(() => _tab = index),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.explore_outlined),
                selectedIcon: Icon(Icons.explore),
                label: 'Entdecken',
              ),
              NavigationDestination(
                icon: Icon(Icons.near_me_outlined),
                selectedIcon: Icon(Icons.near_me),
                label: 'Radar',
              ),
              NavigationDestination(
                icon: Icon(Icons.bookmark_border),
                selectedIcon: Icon(Icons.bookmark),
                label: 'Merkliste',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'Profil',
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _screen(BuildContext context) {
    switch (_tab) {
      case 1:
        return _featureScreen(
          context,
          icon: Icons.map_outlined,
          heading: 'Entdecke die Welt um dich.',
          description:
              'Der native Radar ist noch nicht an GPS und Restaurantdaten angebunden. '
              'Du kannst den bereits funktionierenden Radar weiterhin in der FOODHUNT-Web-App verwenden.',
          nextStep: 'Als Nächstes: Standort, Karte und echte Restaurantdaten verbinden.',
        );
      case 2:
        return _featureScreen(
          context,
          icon: Icons.bookmark_outline,
          heading: 'Deine Food-Favoriten.',
          description:
              'Die bisherigen Reviews, Gerichte und Lieblingsspots bleiben in der Web-App erhalten. '
              'Die mobile Synchronisierung folgt mit dem gemeinsamen Datenmodell.',
          nextStep: 'Keine Daten wurden migriert oder überschrieben.',
        );
      case 3:
        return _profileScreen(context);
      default:
        return _homeScreen(context);
    }
  }

  Widget _header(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      children: [
        Text(
          'FOODHUNT.',
          style: TextStyle(
            fontSize: 23,
            height: 1.1,
            letterSpacing: -1.1,
            fontWeight: FontWeight.w600,
            color: scheme.onSurface,
          ),
        ),
        const SizedBox(width: 5),
        const SizedBox(width: 2),
        const Spacer(),
        IconButton.filledTonal(
          tooltip: _dark ? 'Helles Design' : 'Dunkles Design',
          onPressed: () => setState(() => _dark = !_dark),
          icon: Icon(_dark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
        ),
      ],
    );
  }

  Widget _demoLabel(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(FoodHuntRadii.pill),
        color: Theme.of(context).colorScheme.primaryContainer,
      ),
      child: Text(
        'Flutter-Vorschau · Noch keine Live-Daten',
        style: TextStyle(
          fontSize: 9,
          height: 1.2,
          letterSpacing: 0,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      ),
    );
  }

  Widget _homeScreen(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _categories.where((entry) {
      final matchCategory = _selectedCategory == 'Alle' ||
          _selectedCategory == entry.name;
      final matchQuery = entry.name.toLowerCase().contains(_query.toLowerCase());
      return matchCategory && matchQuery;
    }).toList();
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 15, 18, 28),
      children: [
        _header(context),
        const SizedBox(height: 20),
        _demoLabel(context),
        const SizedBox(height: 22),
        Text(
          'Was gibt’s Gutes?',
          style: theme.textTheme.headlineLarge,
        ),
        const SizedBox(height: 8),
        Text(
          'Finde deinen nächsten Lieblings-Bite – ganz ohne langes Überlegen.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: _muted(context),
          ),
        ),
        const SizedBox(height: 22),
        TextField(
          onChanged: (value) => setState(() => _query = value),
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Worauf hast du Hunger?',
            suffixIcon: Icon(Icons.tune_rounded),
          ),
        ),
        const SizedBox(height: 22),
        _heroCard(context),
        const SizedBox(height: 29),
        Row(
          children: [
            Text('Entdecke nach Lust', style: theme.textTheme.headlineSmall),
            const Spacer(),
            Text(
              'Alle Küchen',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 13),
        SizedBox(
          height: 40,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              for (final name in ['Alle', ..._categories.map((c) => c.name)])
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(name),
                    selected: _selectedCategory == name,
                    onSelected: (_) => setState(() => _selectedCategory = name),
                    showCheckmark: false,
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (filtered.isEmpty)
          _emptyCategory(context)
        else
          LayoutBuilder(builder: (context, constraints) {
            final columns = constraints.maxWidth > 600 ? 3 : 2;
            final tileWidth = (constraints.maxWidth - (columns - 1) * 12) / columns;
            return Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final category in filtered)
                  SizedBox(
                    width: tileWidth,
                    child: _categoryTile(context, category),
                  ),
              ],
            );
          }),
        const SizedBox(height: 23),
        _storyCard(context),
      ],
    );
  }

  Widget _heroCard(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(22, 23, 22, 22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(FoodHuntRadii.large),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: dark
              ? const [Color(0xFF30332F), Color(0xFF30332F)]
              : const [Color(0xFFF1E9E1), Color(0xFFF1E9E1)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '✦  IN DEINER NÄHE',
            style: TextStyle(
              color: dark ? const Color(0xFFF6BD9D) : const Color(0xFF99502E),
              letterSpacing: .7,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 15),
          Text(
            'Dein nächster\nLieblingsspot wartet.',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 26,
              height: 1.14,
              letterSpacing: -.8,
              color: dark ? const Color(0xFFF5F4F0) : FoodHuntColors.darkText,
            ),
          ),
          const SizedBox(height: 9),
          Text(
            'Restaurants statt endloser Suche.',
            style: TextStyle(
              fontSize: 13,
              color: dark ? const Color(0xFFCACDC5) : const Color(0xFF565A55),
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () => setState(() => _tab = 1),
            icon: const Icon(Icons.near_me_outlined),
            label: const Text('Radar öffnen'),
          ),
        ],
      ),
    );
  }

  Widget _categoryTile(BuildContext context, FoodCategory item) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: () => setState(() => _selectedCategory = item.name),
      borderRadius: BorderRadius.circular(FoodHuntRadii.medium),
      child: Ink(
        height: 150,
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: dark ? Theme.of(context).cardColor : item.color,
          borderRadius: BorderRadius.circular(FoodHuntRadii.medium),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: Alignment.center,
              child: Text(item.emoji, style: const TextStyle(fontSize: 53)),
            ),
            const Spacer(),
            Text(
              item.name,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 17,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _emptyCategory(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(FoodHuntRadii.medium),
      ),
      child: Text(
        'Keine passende Kategorie in dieser Vorschau.',
        style: Theme.of(context).textTheme.bodyMedium,
      ),
    );
  }

  Widget _storyCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(19),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(FoodHuntRadii.medium),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Row(
        children: [
          const Text('✨', style: TextStyle(fontSize: 33)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Gut essen. Einfach entscheiden.',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 4),
                Text(
                  'Als Nächstes verbinden wir deine Reviews und echte Restaurants.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: _muted(context),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureScreen(
    BuildContext context, {
    required IconData icon,
    required String heading,
    required String description,
    required String nextStep,
  }) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 15, 18, 30),
      children: [
        _header(context),
        const SizedBox(height: 24),
        _demoLabel(context),
        const SizedBox(height: 31),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 46, horizontal: 22),
          decoration: BoxDecoration(
            color: theme.cardColor,
            borderRadius: BorderRadius.circular(FoodHuntRadii.large),
            border: Border.all(color: theme.dividerColor),
          ),
          child: Column(
            children: [
              CircleAvatar(
                radius: 39,
                backgroundColor: theme.colorScheme.primaryContainer,
                child: Icon(icon, size: 35, color: theme.colorScheme.primary),
              ),
              const SizedBox(height: 21),
              Text(heading,
                  textAlign: TextAlign.center, style: theme.textTheme.headlineSmall),
              const SizedBox(height: 11),
              Text(description,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(color: _muted(context))),
              const SizedBox(height: 16),
              Text(
                nextStep,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _profileScreen(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 15, 18, 30),
      children: [
        _header(context),
        const SizedBox(height: 26),
        Text('Dein FOODHUNT.', style: theme.textTheme.headlineLarge),
        const SizedBox(height: 8),
        Text('Deine App, dein Geschmack, deine Einstellungen.',
            style: theme.textTheme.bodyMedium?.copyWith(color: _muted(context))),
        const SizedBox(height: 21),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(FoodHuntRadii.medium),
            color: theme.cardColor,
          ),
          child: SwitchListTile(
            title: const Text('Dark Mode'),
            subtitle: const Text('Die gleiche weiche Designsprache, auch dunkel.'),
            value: _dark,
            onChanged: (value) => setState(() => _dark = value),
          ),
        ),
        const SizedBox(height: 15),
        _storyCard(context),
      ],
    );
  }

  Color _muted(BuildContext context) => Theme.of(context).brightness ==
          Brightness.dark
      ? const Color(0xFFBAB1AA)
      : FoodHuntColors.mutedText;
}

class FoodCategory {
  final String name;
  final String emoji;
  final Color color;

  const FoodCategory(this.name, this.emoji, this.color);
}
