import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:foodhunt_mobile/main.dart';

void main() {
  testWidgets('home and radar navigation work', (WidgetTester tester) async {
    await tester.pumpWidget(const FoodHuntApp());
    expect(find.text('Was gibt’s Gutes?'), findsOneWidget);
    expect(find.textContaining('Flutter-Vorschau'), findsOneWidget);
    await tester.tap(find.text('Radar'));
    await tester.pumpAndSettle();
    expect(find.text('Entdecke die Welt um dich.'), findsOneWidget);
    expect(find.byIcon(Icons.map_outlined), findsOneWidget);
  });
}
